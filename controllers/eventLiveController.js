// src/controllers/eventLiveController.js
const Event = require("../models/Event");
const EventMat = require("../models/EventMat");
const EventMatSlot = require("../models/EventMatSlot");
const EventMatStream = require("../models/EventMatStream");
const { Op } = require("sequelize");

/* =========================
   Helpers
   ========================= */

const normalize = (s = "") =>
  String(s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();

function getMatKind(label = "") {
  const t = normalize(label);
  if (t.includes("TC") || t.includes("TABLE CENTRALE")) return "TC";
  if (t.includes("PODIUM")) return "PODIUM";
  return "MAT";
}

function sortMats(mats = []) {
  return mats.slice().sort((a, b) => {
    const ao = a.sort_order ?? a.mat_number ?? 0;
    const bo = b.sort_order ?? b.mat_number ?? 0;
    return ao - bo;
  });
}

async function buildHub(eventId) {
  const mats = await EventMat.findAll({
    where: { event_id: eventId },
    order: [
      ["sort_order", "ASC"],
      ["mat_number", "ASC"],
    ],
    raw: true,
  });

  const matIds = mats.map((m) => m.id);

  const hasIsActive = Boolean(EventMatSlot?.rawAttributes?.is_active);

  const slots = matIds.length
    ? await EventMatSlot.findAll({
        where: {
          event_mat_id: { [Op.in]: matIds },
          ...(hasIsActive ? { is_active: 1 } : {}),
        },
        order: [["slot_index", "ASC"]],
        raw: true,
      })
    : [];

  const streams = matIds.length
    ? await EventMatStream.findAll({
        where: { event_mat_id: { [Op.in]: matIds } },
        raw: true,
      })
    : [];

  const slotsByMat = new Map();
  for (const s of slots) {
    const k = s.event_mat_id;
    if (!slotsByMat.has(k)) slotsByMat.set(k, []);
    slotsByMat.get(k).push(s);
  }

  const streamByMat = new Map();
  for (const st of streams) streamByMat.set(st.event_mat_id, st);

  return sortMats(mats).map((m) => ({
    ...m,
    slots: slotsByMat.get(m.id) || [],
    stream: streamByMat.get(m.id) || null,
  }));
}

/**
 * ✅ NOUVEAU : retourne les events "disponibles" en partant des slots/streams
 * (donc on ne loupe pas un event juste parce qu'il n'est pas dans un top 30)
 *
 * Un event est "disponible" si au moins 1 tapis MAT ouvert a :
 * - au moins 1 slot actif
 * OU
 * - un stream_url
 */
async function computeAvailableEvents({ limit = 50 } = {}) {
  const hasIsActive = Boolean(EventMatSlot?.rawAttributes?.is_active);

  // 1) mats qui ont AU MOINS un slot actif
  const slotMatIdsRows = await EventMatSlot.findAll({
    attributes: ["event_mat_id"],
    where: {
      ...(hasIsActive ? { is_active: 1 } : {}),
    },
    group: ["event_mat_id"],
    raw: true,
  });

  // 2) mats qui ont AU MOINS un stream_url
  const streamMatIdsRows = await EventMatStream.findAll({
    attributes: ["event_mat_id"],
    where: {
      stream_url: {
        [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }],
      },
    },
    group: ["event_mat_id"],
    raw: true,
  });

  const candidateMatIds = Array.from(
    new Set([
      ...slotMatIdsRows.map((r) => r.event_mat_id),
      ...streamMatIdsRows.map((r) => r.event_mat_id),
    ])
  );

  if (!candidateMatIds.length) return [];

  // 3) récupérer ces mats, filtrer MAT + ouverts
  const candidateMats = await EventMat.findAll({
    where: { id: { [Op.in]: candidateMatIds } },
    raw: true,
  });

  const playableOpenMats = candidateMats.filter(
    (m) => getMatKind(m.label || "") === "MAT" && Boolean(m.is_open)
  );

  const eventIds = Array.from(new Set(playableOpenMats.map((m) => m.event_id)));
  if (!eventIds.length) return [];

  // 4) fetch events (actifs)
  const events = await Event.findAll({
    where: {
      id: { [Op.in]: eventIds },
      is_active: true,
    },
    order: [
      ["start", "DESC"],
      ["id", "DESC"],
    ],
    raw: true,
  });

  if (!events.length) return [];

  // 5) stats : on recharge mats de ces events (pour compter correctement)
  const matsAll = await EventMat.findAll({
    where: { event_id: { [Op.in]: events.map((e) => e.id) } },
    raw: true,
  });

  const matIdsAll = matsAll.map((m) => m.id);

  const slotsAll = matIdsAll.length
    ? await EventMatSlot.findAll({
        where: {
          event_mat_id: { [Op.in]: matIdsAll },
          ...(hasIsActive ? { is_active: 1 } : {}),
        },
        raw: true,
      })
    : [];

  const streamsAll = matIdsAll.length
    ? await EventMatStream.findAll({
        where: { event_mat_id: { [Op.in]: matIdsAll } },
        raw: true,
      })
    : [];

  const matsByEvent = new Map();
  for (const m of matsAll) {
    if (!matsByEvent.has(m.event_id)) matsByEvent.set(m.event_id, []);
    matsByEvent.get(m.event_id).push(m);
  }

  const slotsByMat = new Map();
  for (const s of slotsAll) {
    if (!slotsByMat.has(s.event_mat_id)) slotsByMat.set(s.event_mat_id, []);
    slotsByMat.get(s.event_mat_id).push(s);
  }

  const streamByMat = new Map();
  for (const st of streamsAll) streamByMat.set(st.event_mat_id, st);

  const out = [];

  for (const ev of events) {
    const matsOfEvent = matsByEvent.get(ev.id) || [];

    const playable = matsOfEvent.filter(
      (m) => getMatKind(m.label || "") === "MAT"
    );
    const open = playable.filter((m) => Boolean(m.is_open));

    const mats_total = playable.length;
    const mats_open = open.length;

    const mats_with_slots = open.filter((m) => {
      const sl = slotsByMat.get(m.id) || [];
      return sl.length > 0;
    }).length;

    const mats_with_stream = open.filter((m) => {
      const st = streamByMat.get(m.id);
      return Boolean(st?.stream_url);
    }).length;

    const mats_live = open.filter((m) => {
      const st = streamByMat.get(m.id);
      return Boolean(st?.stream_url) && Boolean(st?.is_live);
    }).length;

    const is_available = mats_with_slots > 0 || mats_with_stream > 0;

    if (is_available) {
      out.push({
        ...ev,
        stats: { mats_total, mats_open, mats_with_slots, mats_with_stream, mats_live },
      });
    }
  }

  return out.slice(0, limit);
}

/* =========================
   Controller
   ========================= */

module.exports = {
  /**
   * PUBLIC: liste des compétitions dispo (slots et/ou streams)
   * GET /api/live-events/available
   */
  getAvailableEvents: async (req, res) => {
    const limit = Number(req.query.limit) || 50;
    const events = await computeAvailableEvents({ limit });
    return res.json({ events });
  },

  /**
   * PUBLIC: hub pour un event précis
   * GET /api/live-events/:eventId/hub
   */
  getLiveHub: async (req, res) => {
    const eventId = Number(req.params.eventId);
    if (!eventId) return res.status(400).json({ message: "eventId invalide" });

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const mats = await buildHub(eventId);
    return res.json({ event, mats });
  },

  /**
   * PUBLIC: hub pour l'event "courant"
   * GET /api/live-events/current
   * GET /api/live-events/current/hub
   */
  getCurrentLiveHub: async (req, res) => {
    const available = await computeAvailableEvents({ limit: 50 });

    // ✅ priorité : le plus récent "disponible"
    if (available.length) {
      const best = available[0];
      const mats = await buildHub(best.id);
      return res.json({ event: best, mats });
    }

    // fallback : dernier event actif
    const event = await Event.findOne({
      where: { is_active: true },
      order: [["id", "DESC"]],
    });

    if (!event) return res.json({ event: null, mats: [] });

    const mats = await buildHub(event.id);
    return res.json({ event, mats });
  },

  /**
   * ADMIN: upsert stream
   * PUT /api/live-events/:eventId/mats/:matNumber/stream
   */
  upsertMatStream: async (req, res) => {
    const eventId = Number(req.params.eventId);
    const matNumber = Number(req.params.matNumber);

    const { provider, stream_url, embed_url, title, is_live } = req.body || {};
    if (!eventId || !matNumber) {
      return res.status(400).json({ message: "Paramètres invalides" });
    }
    if (!stream_url) {
      return res.status(400).json({ message: "stream_url requis" });
    }

    const mat = await EventMat.findOne({
      where: { event_id: eventId, mat_number: matNumber },
    });
    if (!mat) return res.status(404).json({ message: "Mat not found" });

    await EventMatStream.upsert(
      {
        event_mat_id: mat.id,
        provider: provider || null,
        stream_url,
        embed_url: embed_url || null,
        title: title || null,
        is_live: is_live === undefined ? true : Boolean(is_live),
        updated_at: new Date(),
      },
      { returning: true }
    );

    const stream = await EventMatStream.findOne({
      where: { event_mat_id: mat.id },
      raw: true,
    });

    return res.json({ ok: true, stream });
  },

  /**
   * ADMIN: toggle live
   * PATCH /api/live-events/:eventId/mats/:matNumber/stream/toggle
   */
  toggleMatStream: async (req, res) => {
    const eventId = Number(req.params.eventId);
    const matNumber = Number(req.params.matNumber);

    const mat = await EventMat.findOne({
      where: { event_id: eventId, mat_number: matNumber },
    });
    if (!mat) return res.status(404).json({ message: "Mat not found" });

    const stream = await EventMatStream.findOne({
      where: { event_mat_id: mat.id },
    });
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    stream.is_live = !Boolean(stream.is_live);
    stream.updated_at = new Date();
    await stream.save();

    return res.json({ ok: true, is_live: stream.is_live });
  },

  /**
   * ADMIN: delete stream
   * DELETE /api/live-events/:eventId/mats/:matNumber/stream
   */
  deleteMatStream: async (req, res) => {
    const eventId = Number(req.params.eventId);
    const matNumber = Number(req.params.matNumber);

    const mat = await EventMat.findOne({
      where: { event_id: eventId, mat_number: matNumber },
    });
    if (!mat) return res.status(404).json({ message: "Mat not found" });

    await EventMatStream.destroy({ where: { event_mat_id: mat.id } });
    return res.json({ ok: true });
  },
};
