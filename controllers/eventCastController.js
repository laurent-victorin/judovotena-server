// controllers/castController.js
const { Op } = require("sequelize");
const sequelize = require("../database");
const errorController = require("./errorController");

const Event = require("../models/Event");
const EventMat = require("../models/EventMat");
const EventMatSlot = require("../models/EventMatSlot");
const EventBroadcastMessage = require("../models/EventBroadcastMessage");
const EventCastState = require("../models/EventCastState");

const toInt = (v, fallback = null) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

const assertMatNumber = (n) => Number.isInteger(n) && n >= 1 && n <= 10;
const assertSlotIndex = (n) => Number.isInteger(n) && n >= 1 && n <= 3;

const castController = {
  /// GET
  // Bundle complet (mats + slots + messages + cast state)
  getCastBundle: async (req, res) => {
    const eventId = toInt(req.params.eventId);

    if (!eventId) return res.status(400).json({ message: "eventId invalide" });

    try {
      // Si tes relations.js sont bien chargées, include marche nickel
      const event = await Event.findByPk(eventId, {
        attributes: ["id", "titre", "start", "end", "type_event", "level_event"],
        include: [
          {
            model: EventMat,
            as: "Mats",
            required: false,
            include: [
              {
                model: EventMatSlot,
                as: "Slots",
                required: false,
              },
            ],
          },
          {
            model: EventBroadcastMessage,
            as: "BroadcastMessages",
            required: false,
          },
          {
            model: EventCastState,
            as: "CastState",
            required: false,
            include: [
              {
                model: EventBroadcastMessage,
                as: "ActiveMessage",
                required: false,
              },
            ],
          },
        ],
      });

      if (!event) {
        return res.status(404).json({ message: "Événement introuvable" });
      }

      // Tri mats/slots/messages côté serveur (pour un rendu stable)
      const mats = (event.Mats || [])
        .map((m) => ({
          ...m.toJSON(),
          Slots: (m.Slots || []).sort((a, b) => a.slot_index - b.slot_index),
        }))
        .sort((a, b) => {
          const sa = a.sort_order ?? a.mat_number ?? 0;
          const sb = b.sort_order ?? b.mat_number ?? 0;
          return sa - sb;
        });

      const messages = (event.BroadcastMessages || [])
        .map((x) => x.toJSON())
        .sort((a, b) => {
          // pinned en premier, ensuite actifs, ensuite date desc
          const pa = a.is_pinned ? 1 : 0;
          const pb = b.is_pinned ? 1 : 0;
          if (pb !== pa) return pb - pa;

          const aa = a.is_active ? 1 : 0;
          const ab = b.is_active ? 1 : 0;
          if (ab !== aa) return ab - aa;

          const da = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          const db = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          return db - da;
        });

      res.json({
        event: event.toJSON(),
        mats,
        messages,
        state: event.CastState ? event.CastState.toJSON() : null,
      });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Messages list (si tu veux récupérer juste les messages)
  getMessagesByEvent: async (req, res) => {
    const eventId = toInt(req.params.eventId);
    if (!eventId) return res.status(400).json({ message: "eventId invalide" });

    try {
      const items = await EventBroadcastMessage.findAll({
        where: { event_id: eventId },
        order: [
          ["is_pinned", "DESC"],
          ["is_active", "DESC"],
          ["updated_at", "DESC"],
          ["id", "DESC"],
        ],
      });
      res.json(items);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT
  // Upsert Mat + Slots (remplace tous les slots du tapis)
  upsertMatWithSlots: async (req, res) => {
    const eventId = toInt(req.params.eventId);
    const matNumber = toInt(req.params.matNumber);

    if (!eventId) return res.status(400).json({ message: "eventId invalide" });
    if (!assertMatNumber(matNumber))
      return res.status(400).json({ message: "matNumber doit être entre 1 et 10" });

    const { label, is_open, sort_order, slots = [] } = req.body || {};

    // slots = [{slot_index:1..3,label, note, is_active}]
    const cleanSlots = Array.isArray(slots)
      ? slots
          .map((s) => ({
            slot_index: toInt(s.slot_index),
            label: (s.label || "").trim(),
            note: s.note ? String(s.note).trim() : null,
            is_active: s.is_active !== undefined ? Boolean(s.is_active) : true,
          }))
          .filter((s) => assertSlotIndex(s.slot_index) && s.label)
      : [];

    if (cleanSlots.length > 3) {
      return res.status(400).json({ message: "Maximum 3 catégories par tapis" });
    }

    // éviter doublons slot_index
    const uniq = new Set();
    for (const s of cleanSlots) {
      if (uniq.has(s.slot_index)) {
        return res
          .status(400)
          .json({ message: "slot_index dupliqué (1..3) dans slots[]" });
      }
      uniq.add(s.slot_index);
    }

    const t = await sequelize.transaction();
    try {
      // s’assurer que l’event existe
      const ev = await Event.findByPk(eventId, { transaction: t });
      if (!ev) {
        await t.rollback();
        return res.status(404).json({ message: "Événement introuvable" });
      }

      let mat = await EventMat.findOne({
        where: { event_id: eventId, mat_number: matNumber },
        transaction: t,
      });

      if (!mat) {
        mat = await EventMat.create(
          {
            event_id: eventId,
            mat_number: matNumber,
            label: label ?? null,
            is_open: is_open !== undefined ? Boolean(is_open) : true,
            sort_order: sort_order ? toInt(sort_order, matNumber) : matNumber,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction: t }
        );
      } else {
        await mat.update(
          {
            label: label ?? mat.label,
            is_open: is_open !== undefined ? Boolean(is_open) : mat.is_open,
            sort_order:
              sort_order !== undefined && sort_order !== null
                ? toInt(sort_order, mat.sort_order)
                : mat.sort_order,
            updated_at: new Date(),
          },
          { transaction: t }
        );
      }

      // remplacer slots (simple et fiable)
      await EventMatSlot.destroy({
        where: { event_mat_id: mat.id },
        transaction: t,
      });

      if (cleanSlots.length > 0) {
        await EventMatSlot.bulkCreate(
          cleanSlots.map((s) => ({
            event_mat_id: mat.id,
            slot_index: s.slot_index,
            label: s.label,
            note: s.note,
            is_active: s.is_active,
            created_at: new Date(),
            updated_at: new Date(),
          })),
          { transaction: t }
        );
      }

      await t.commit();

      // renvoyer le mat complet
      const matFull = await EventMat.findByPk(mat.id, {
        include: [{ model: EventMatSlot, as: "Slots", required: false }],
      });

      res.json(matFull);
    } catch (error) {
      await t.rollback();
      errorController._500(error, req, res);
    }
  },

  // Toggle is_open d’un tapis
  toggleMatOpen: async (req, res) => {
    const eventId = toInt(req.params.eventId);
    const matNumber = toInt(req.params.matNumber);

    if (!eventId) return res.status(400).json({ message: "eventId invalide" });
    if (!assertMatNumber(matNumber))
      return res.status(400).json({ message: "matNumber doit être entre 1 et 10" });

    try {
      const mat = await EventMat.findOne({
        where: { event_id: eventId, mat_number: matNumber },
      });

      if (!mat) return res.status(404).json({ message: "Tapis introuvable" });

      mat.is_open = !mat.is_open;
      mat.updated_at = new Date();
      await mat.save();

      res.json({ message: "Mat status updated", is_open: mat.is_open });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Cast state (mode + active_message_id)
  upsertCastState: async (req, res) => {
    const eventId = toInt(req.params.eventId);
    if (!eventId) return res.status(400).json({ message: "eventId invalide" });

    const { mode, active_message_id, updated_by_user_id } = req.body || {};
    const safeMode =
      mode === "MESSAGE" || mode === "MATS" ? mode : "MATS";

    try {
      // vérifier event existe
      const ev = await Event.findByPk(eventId);
      if (!ev) return res.status(404).json({ message: "Événement introuvable" });

      let state = await EventCastState.findOne({ where: { event_id: eventId } });

      if (!state) {
        state = await EventCastState.create({
          event_id: eventId,
          mode: safeMode,
          active_message_id: active_message_id ? toInt(active_message_id) : null,
          updated_by_user_id: updated_by_user_id ? toInt(updated_by_user_id) : null,
          updated_at: new Date(),
        });
      } else {
        await state.update({
          mode: safeMode,
          active_message_id: active_message_id ? toInt(active_message_id) : null,
          updated_by_user_id: updated_by_user_id ? toInt(updated_by_user_id) : null,
          updated_at: new Date(),
        });
      }

      // renvoyer avec ActiveMessage si relations présentes
      const full = await EventCastState.findByPk(state.id, {
        include: [{ model: EventBroadcastMessage, as: "ActiveMessage", required: false }],
      });

      res.json(full);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  addMessage: async (req, res) => {
    const eventId = toInt(req.params.eventId);
    if (!eventId) return res.status(400).json({ message: "eventId invalide" });

    const {
      type = "INFO",
      title = null,
      content,
      target_mat_number = null,
      severity = null,
      is_pinned = false,
      is_active = true,
      starts_at = null,
      ends_at = null,
    } = req.body || {};

    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: "content est obligatoire" });
    }

    const target = target_mat_number !== null ? toInt(target_mat_number) : null;
    if (target !== null && !assertMatNumber(target)) {
      return res.status(400).json({ message: "target_mat_number doit être entre 1 et 10" });
    }

    try {
      const msg = await EventBroadcastMessage.create({
        event_id: eventId,
        type: String(type || "INFO").slice(0, 20),
        title: title ? String(title).slice(0, 120) : null,
        content: String(content),
        target_mat_number: target,
        severity: severity ? String(severity).slice(0, 20) : null,
        is_pinned: Boolean(is_pinned),
        is_active: Boolean(is_active),
        starts_at: starts_at ? new Date(starts_at) : null,
        ends_at: ends_at ? new Date(ends_at) : null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      res.status(201).json(msg);
    } catch (error) {
      errorController._400(error, req, res);
    }
  },

  /// PUT
  updateMessage: async (req, res) => {
    const eventId = toInt(req.params.eventId);
    const id = toInt(req.params.id);

    if (!eventId) return res.status(400).json({ message: "eventId invalide" });
    if (!id) return res.status(400).json({ message: "id invalide" });

    const {
      type,
      title,
      content,
      target_mat_number,
      severity,
      is_pinned,
      is_active,
      starts_at,
      ends_at,
    } = req.body || {};

    try {
      const msg = await EventBroadcastMessage.findOne({
        where: { id, event_id: eventId },
      });

      if (!msg) return res.status(404).json({ message: "Message introuvable" });

      const target =
        target_mat_number === undefined
          ? msg.target_mat_number
          : target_mat_number === null
          ? null
          : toInt(target_mat_number);

      if (target !== null && target !== undefined && !assertMatNumber(target)) {
        return res.status(400).json({ message: "target_mat_number doit être entre 1 et 10" });
      }

      await msg.update({
        type: type !== undefined ? String(type || "INFO").slice(0, 20) : msg.type,
        title:
          title !== undefined
            ? title
              ? String(title).slice(0, 120)
              : null
            : msg.title,
        content: content !== undefined ? String(content) : msg.content,
        target_mat_number: target,
        severity:
          severity !== undefined
            ? severity
              ? String(severity).slice(0, 20)
              : null
            : msg.severity,
        is_pinned: is_pinned !== undefined ? Boolean(is_pinned) : msg.is_pinned,
        is_active: is_active !== undefined ? Boolean(is_active) : msg.is_active,
        starts_at: starts_at !== undefined ? (starts_at ? new Date(starts_at) : null) : msg.starts_at,
        ends_at: ends_at !== undefined ? (ends_at ? new Date(ends_at) : null) : msg.ends_at,
        updated_at: new Date(),
      });

      res.json(msg);
    } catch (error) {
      errorController.errorCatch(error, res);
    }
  },

  toggleMessageActive: async (req, res) => {
    const eventId = toInt(req.params.eventId);
    const id = toInt(req.params.id);

    if (!eventId) return res.status(400).json({ message: "eventId invalide" });
    if (!id) return res.status(400).json({ message: "id invalide" });

    try {
      const msg = await EventBroadcastMessage.findOne({
        where: { id, event_id: eventId },
      });

      if (!msg) return res.status(404).json({ message: "Message introuvable" });

      msg.is_active = !msg.is_active;
      msg.updated_at = new Date();
      await msg.save();

      res.json({ message: "Message status updated", is_active: msg.is_active });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE
  deleteMat: async (req, res) => {
    const eventId = toInt(req.params.eventId);
    const matNumber = toInt(req.params.matNumber);

    if (!eventId) return res.status(400).json({ message: "eventId invalide" });
    if (!assertMatNumber(matNumber))
      return res.status(400).json({ message: "matNumber doit être entre 1 et 10" });

    const t = await sequelize.transaction();
    try {
      const mat = await EventMat.findOne({
        where: { event_id: eventId, mat_number: matNumber },
        transaction: t,
      });

      if (!mat) {
        await t.rollback();
        return res.status(404).json({ message: "Tapis introuvable" });
      }

      await EventMatSlot.destroy({
        where: { event_mat_id: mat.id },
        transaction: t,
      });

      await mat.destroy({ transaction: t });

      await t.commit();
      res.json({ message: "Tapis supprimé" });
    } catch (error) {
      await t.rollback();
      errorController.errorCatch(error, res);
    }
  },

  deleteMessage: async (req, res) => {
    const eventId = toInt(req.params.eventId);
    const id = toInt(req.params.id);

    if (!eventId) return res.status(400).json({ message: "eventId invalide" });
    if (!id) return res.status(400).json({ message: "id invalide" });

    try {
      const msg = await EventBroadcastMessage.findOne({
        where: { id, event_id: eventId },
      });

      if (!msg) return res.status(404).json({ message: "Message introuvable" });

      await msg.destroy();
      res.json({ message: "Message supprimé" });
    } catch (error) {
      errorController.errorCatch(error, res);
    }
  },
};

module.exports = castController;
