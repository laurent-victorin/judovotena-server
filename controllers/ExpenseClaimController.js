// controllers/ExpenseClaimController.js
const ExpenseClaim = require("../models/ExpenseClaim");
const ExpenseClaimItem = require("../models/ExpenseClaimItem");
const ExpenseClaimAttachment = require("../models/ExpenseClaimAttachment");
const EventBudgetCode = require("../models/EventBudgetCode");
const Users = require("../models/Users");
const Event = require("../models/Event");
const sequelize = require("../database");

const { Op, fn, col, literal } = require("sequelize");

function numOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function intOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function clampInt(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.trunc(x)));
}

function getIkCoefFromClaimFields({
  moyen_transport,
  covoiturage,
  covoiturage_role,
  covoiturage_nb_passagers,
}) {
  if (moyen_transport !== "voiture") return 0;
  if (!covoiturage) return 0.28;
  if (covoiturage_role === "Passager") return 0;

  const n = clampInt(covoiturage_nb_passagers ?? 0, 0, 99);
  if (n === 0) return 0.28;
  if (n === 1) return 0.38;
  if (n === 2) return 0.48;
  return 0.58;
}

async function recalcTotals(claimId, t) {
  // total_frais = somme items
  // total_general = items + trajet + indemnités
  const items = await ExpenseClaimItem.findAll({
    where: { expense_claim_id: claimId },
    attributes: ["montant"],
    transaction: t,
  });

  const itemsSum = items.reduce((acc, it) => acc + Number(it.montant || 0), 0);

  const claim = await ExpenseClaim.findByPk(claimId, { transaction: t });
  if (!claim) return;

  const trajet = Number(claim.montant_trajet || 0);
  const indTenue = Number(claim.indemnite_tenue || 0);
  const indRep = Number(claim.indemnite_representation || 0);

  const total_frais = Number(itemsSum.toFixed(2));
  const total_general = Number(
    (itemsSum + trajet + indTenue + indRep).toFixed(2),
  );

  await claim.update(
    { total_frais, total_general, updated_at: new Date() },
    { transaction: t },
  );
}

const ExpenseClaimController = {
  // GET /api/expense/claims
  getAll: async (req, res) => {
    try {
      const {
        status,
        eventId,
        userId,
        budgetCodeId,
        from,
        to,
        q, // recherche libre (nom/prénom/email)
      } = req.query;

      const where = {};
      if (status) where.statut = status;
      if (eventId) where.event_id = Number(eventId);
      if (userId) where.user_id = Number(userId);
      if (budgetCodeId) where.code_budgetaire_id = Number(budgetCodeId);

      // filtre date : sur created_at (ou date_soumission si tu préfères)
      if (from || to) {
        where.created_at = {};
        if (from) where.created_at[Op.gte] = new Date(from);
        if (to) where.created_at[Op.lte] = new Date(to);
      }

      const include = [
        {
          model: Users,
          as: "Claimant",
          attributes: ["id", "nom", "prenom", "email", "photoURL", "role_id"],
          required: false,
        },
        {
          model: Event,
          as: "ClaimEvent",
          required: false,
        },
        {
          model: EventBudgetCode,
          as: "BudgetCode",
          required: false,
        },
        {
          model: Users,
          as: "ClaimValidator",
          attributes: ["id", "nom", "prenom", "email"],
          required: false,
        },
      ];

      // recherche user (via include)
      if (q && String(q).trim() !== "") {
        const s = String(q).trim();
        include[0].where = {
          [Op.or]: [
            { nom: { [Op.like]: `%${s}%` } },
            { prenom: { [Op.like]: `%${s}%` } },
            { email: { [Op.like]: `%${s}%` } },
          ],
        };
        include[0].required = true; // force matching user
      }

      const rows = await ExpenseClaim.findAll({
        where,
        include,
        order: [["created_at", "DESC"]],
      });

      return res.json(rows);
    } catch (error) {
      console.error("ExpenseClaimController.getAll error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // GET /api/expense/claims/count
  count: async (req, res) => {
    try {
      const where = {};
      if (req.query.status) where.statut = req.query.status;

      const total = await ExpenseClaim.count({ where });
      return res.json({ total });
    } catch (error) {
      console.error("ExpenseClaimController.count error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // GET /api/expense/claims/stats
  getStats: async (req, res) => {
    try {
      // 1) par statut
      const byStatus = await ExpenseClaim.findAll({
        attributes: ["statut", [fn("COUNT", col("id")), "count"]],
        group: ["statut"],
      });

      // 2) par mois (sur created_at) => YYYY-MM
      const byMonth = await ExpenseClaim.findAll({
        attributes: [
          [fn("DATE_FORMAT", col("created_at"), "%Y-%m"), "month"],
          [fn("COUNT", col("id")), "count"],
          [fn("SUM", col("total_general")), "sum_total"],
        ],
        group: [literal("month")],
        order: [[literal("month"), "ASC"]],
      });

      return res.json({ byStatus, byMonth });
    } catch (error) {
      console.error("ExpenseClaimController.getStats error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // GET /api/expense/claims/export  (CSV compatible Excel)
  exportExcel: async (req, res) => {
    try {
      // mêmes filtres que getAll (simplifié)
      const where = {};
      if (req.query.status) where.statut = req.query.status;
      if (req.query.eventId) where.event_id = Number(req.query.eventId);
      if (req.query.userId) where.user_id = Number(req.query.userId);

      const rows = await ExpenseClaim.findAll({
        where,
        include: [
          {
            model: Users,
            as: "Claimant",
            attributes: ["nom", "prenom", "email"],
            required: false,
          },
          { model: Event, as: "ClaimEvent", required: false },
          { model: EventBudgetCode, as: "BudgetCode", required: false },
        ],
        order: [["created_at", "DESC"]],
      });

      // CSV ; (Excel FR)
      const header = [
        "ID",
        "Statut",
        "User",
        "Email",
        "Event",
        "Code budgétaire",
        "Trajet",
        "Indemnité tenue",
        "Indemnité représentation",
        "Total frais",
        "Total général",
        "Créé le",
      ].join(";");

      const lines = rows.map((r) => {
        const u = r.Claimant;
        const ev = r.ClaimEvent;
        const bc = r.BudgetCode;
        const userLabel = u ? `${u.prenom || ""} ${u.nom || ""}`.trim() : "";
        const eventLabel = ev?.nom_event || ev?.nom || ev?.title || ""; // selon ton modèle Event
        const codeLabel = bc ? `${bc.code} ${bc.libelle}` : "";

        const safe = (v) =>
          String(v ?? "")
            .replaceAll(";", " ")
            .replaceAll("\n", " ");

        return [
          r.id,
          r.statut,
          safe(userLabel),
          safe(u?.email || ""),
          safe(eventLabel),
          safe(codeLabel),
          Number(r.montant_trajet || 0).toFixed(2),
          Number(r.indemnite_tenue || 0).toFixed(2),
          Number(r.indemnite_representation || 0).toFixed(2),
          Number(r.total_frais || 0).toFixed(2),
          Number(r.total_general || 0).toFixed(2),
          r.created_at ? new Date(r.created_at).toISOString() : "",
        ].join(";");
      });

      const csv = "\uFEFF" + [header, ...lines].join("\n"); // BOM pour Excel
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="fiches_frais_${Date.now()}.csv"`,
      );
      return res.send(csv);
    } catch (error) {
      console.error("ExpenseClaimController.exportExcel error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // GET /api/users/:userId/expense/claims
  getByUser: async (req, res) => {
    try {
      const userId = Number(req.params.userId);

      const rows = await ExpenseClaim.findAll({
        where: { user_id: userId },
        include: [
          { model: Event, as: "ClaimEvent", required: false },
          { model: EventBudgetCode, as: "BudgetCode", required: false },
        ],
        order: [["created_at", "DESC"]],
      });

      return res.json(rows);
    } catch (error) {
      console.error("ExpenseClaimController.getByUser error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // GET /api/expense/claims/:id
  getById: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const row = await ExpenseClaim.findByPk(id, {
        include: [
          {
            model: Users,
            as: "Claimant",
            attributes: ["id", "nom", "prenom", "email"],
            required: false,
          },
          {
            model: Users,
            as: "ClaimValidator",
            attributes: ["id", "nom", "prenom", "email"],
            required: false,
          },
          { model: Event, as: "ClaimEvent", required: false },
          { model: EventBudgetCode, as: "BudgetCode", required: false },

          // items + attachments
          { model: ExpenseClaimItem, as: "ClaimItems", required: false },
          {
            model: ExpenseClaimAttachment,
            as: "ClaimAttachments",
            required: false,
          },
        ],
      });

      if (!row)
        return res.status(404).json({ message: "Fiche de frais introuvable" });
      return res.json(row);
    } catch (error) {
      console.error("ExpenseClaimController.getById error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // POST /api/expense/claims
  create: async (req, res) => {
    try {
      const user_id = Number(req.body.user_id);
      const event_id = Number(req.body.event_id);

      if (!user_id || !event_id) {
        return res
          .status(400)
          .json({ message: "user_id et event_id sont requis" });
      }

      // ✅ Normalisation covoiturage
      const moyen = req.body.moyen_transport || null;

      // si pas voiture, covoiturage forcé à false (logique métier)
      const covoiturage =
        moyen !== "voiture"
          ? 0
          : req.body.covoiturage == null
            ? 0
            : Number(!!req.body.covoiturage);

      // rétro-compat front : carpool_role/carpool_with
      const covRoleRaw = (
        req.body.covoiturage_role ||
        req.body.carpool_role ||
        ""
      ).trim();
      const covWithRaw = (
        req.body.covoiturage_avec ||
        req.body.carpool_with ||
        ""
      ).trim();

      let covoiturage_role = covoiturage ? covRoleRaw || null : null;
      let covoiturage_avec = covoiturage ? covWithRaw || null : null;

      // nb passagers : entier >= 0 (utile surtout si conducteur)
      let covoiturage_nb_passagers = covoiturage
        ? (intOrNull(req.body.covoiturage_nb_passagers) ?? 0)
        : 0;

      if (covoiturage) {
        // validation role
        if (
          covoiturage_role !== "Conducteur" &&
          covoiturage_role !== "Passager"
        ) {
          return res.status(400).json({
            message:
              "covoiturage_role doit être 'Conducteur' ou 'Passager' lorsque covoiturage = true",
          });
        }

        // validation "avec qui"
        if (!covoiturage_avec) {
          return res.status(400).json({
            message: "covoiturage_avec est requis lorsque covoiturage = true",
          });
        }

        // si passager, nb_passagers n’a pas de sens => 0
        if (covoiturage_role === "Passager") {
          covoiturage_nb_passagers = 0;
        } else {
          // conducteur : clamp et sécurité
          covoiturage_nb_passagers = clampInt(
            Number(covoiturage_nb_passagers || 0),
            0,
            99,
          );
        }
      }

      const coef = getIkCoefFromClaimFields({
        moyen_transport: moyen,
        covoiturage,
        covoiturage_role,
        covoiturage_nb_passagers,
      });

      const km = numOrNull(req.body.distance_km) ?? 0;
      const kmTotal = (
        req.body.aller_retour == null ? 1 : Number(!!req.body.aller_retour)
      )
        ? km * 2
        : km;

      const taux_km = coef;
      const montant_trajet = Number((kmTotal * coef).toFixed(2));

      const payload = {
        user_id,
        event_id,
        code_budgetaire_id: numOrNull(req.body.code_budgetaire_id),
        statut: req.body.statut || "draft",

        trajet_necessaire:
          req.body.trajet_necessaire == null
            ? 1
            : Number(!!req.body.trajet_necessaire),
        moyen_transport: moyen,
        aller_retour:
          req.body.aller_retour == null ? 1 : Number(!!req.body.aller_retour),

        depart: req.body.depart || null,
        arrivee: req.body.arrivee || null,

        distance_km: numOrNull(req.body.distance_km),
        taux_km,
        montant_trajet,

        covoiturage,
        covoiturage_role, // ✅ NEW
        covoiturage_nb_passagers, // ✅ NEW
        covoiturage_avec,

        indemnite_tenue: numOrNull(req.body.indemnite_tenue) ?? 0,
        indemnite_representation:
          numOrNull(req.body.indemnite_representation) ?? 0,

        commentaire: req.body.commentaire || null,

        created_at: new Date(),
        updated_at: new Date(),
      };

      const row = await ExpenseClaim.create(payload);

      // initialise totaux
      await recalcTotals(row.id);

      const full = await ExpenseClaim.findByPk(row.id, {
        include: [
          { model: Event, as: "ClaimEvent", required: false },
          { model: EventBudgetCode, as: "BudgetCode", required: false },
        ],
      });

      return res.status(201).json(full);
    } catch (error) {
      console.error("ExpenseClaimController.create error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // PUT /api/expense/claims/:id
  update: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const row = await ExpenseClaim.findByPk(id);
      if (!row) {
        return res.status(404).json({ message: "Fiche introuvable" });
      }

      // ✅ correction rapide :
      // autoriser modification si draft / submitted / rejected
      // bloquer si approved / paid
      if (!["draft", "submitted", "rejected"].includes(row.statut)) {
        return res.status(400).json({
          message:
            "Modification non autorisée : seules les fiches brouillon, soumises ou rejetées peuvent être modifiées.",
        });
      }

      // ===== 1) Construire l'état final (row + body) =====
      const next_moyen_transport =
        req.body.moyen_transport !== undefined
          ? req.body.moyen_transport
          : row.moyen_transport;

      const next_covoiturage =
        req.body.covoiturage == null
          ? Number(!!row.covoiturage)
          : Number(!!req.body.covoiturage);

      const roleFromBody = req.body.covoiturage_role ?? req.body.carpool_role;
      const withFromBody = req.body.covoiturage_avec ?? req.body.carpool_with;

      const next_covoiturage_role =
        roleFromBody !== undefined
          ? String(roleFromBody || "").trim()
          : row.covoiturage_role || null;

      const next_covoiturage_avec =
        withFromBody !== undefined
          ? String(withFromBody || "").trim()
          : row.covoiturage_avec || null;

      const nbFromBody =
        req.body.covoiturage_nb_passagers !== undefined
          ? intOrNull(req.body.covoiturage_nb_passagers)
          : (row.covoiturage_nb_passagers ?? 0);

      let next_covoiturage_nb_passagers = nbFromBody ?? 0;

      // ===== 2) Normaliser cohérence covoiturage =====
      let covoiturage =
        next_moyen_transport !== "voiture" ? 0 : next_covoiturage;

      let covoiturage_role = covoiturage ? next_covoiturage_role || null : null;
      let covoiturage_avec = covoiturage ? next_covoiturage_avec || null : null;
      let covoiturage_nb_passagers = covoiturage
        ? Number(next_covoiturage_nb_passagers || 0)
        : 0;

      if (covoiturage) {
        if (
          covoiturage_role !== "Conducteur" &&
          covoiturage_role !== "Passager"
        ) {
          return res.status(400).json({
            message:
              "covoiturage_role doit être 'Conducteur' ou 'Passager' lorsque covoiturage = true",
          });
        }

        if (!covoiturage_avec) {
          return res.status(400).json({
            message: "covoiturage_avec est requis lorsque covoiturage = true",
          });
        }

        if (covoiturage_role === "Passager") {
          covoiturage_nb_passagers = 0;
        } else {
          covoiturage_nb_passagers = clampInt(
            Math.floor(Number(covoiturage_nb_passagers || 0)),
            0,
            99,
          );
        }
      } else {
        covoiturage_role = null;
        covoiturage_avec = null;
        covoiturage_nb_passagers = 0;
      }

      // ===== 3) Payload update =====
      const payload = {
        code_budgetaire_id: numOrNull(req.body.code_budgetaire_id),

        trajet_necessaire:
          req.body.trajet_necessaire == null
            ? row.trajet_necessaire
            : Number(!!req.body.trajet_necessaire),

        moyen_transport: next_moyen_transport,

        aller_retour:
          req.body.aller_retour == null
            ? row.aller_retour
            : Number(!!req.body.aller_retour),

        depart: req.body.depart ?? row.depart,
        arrivee: req.body.arrivee ?? row.arrivee,

        distance_km:
          req.body.distance_km == null
            ? row.distance_km
            : numOrNull(req.body.distance_km),

        taux_km:
          req.body.taux_km == null ? row.taux_km : numOrNull(req.body.taux_km),

        montant_trajet:
          req.body.montant_trajet == null
            ? row.montant_trajet
            : numOrNull(req.body.montant_trajet),

        covoiturage,
        covoiturage_role,
        covoiturage_nb_passagers,
        covoiturage_avec,

        indemnite_tenue:
          req.body.indemnite_tenue == null
            ? row.indemnite_tenue
            : (numOrNull(req.body.indemnite_tenue) ?? 0),

        indemnite_representation:
          req.body.indemnite_representation == null
            ? row.indemnite_representation
            : (numOrNull(req.body.indemnite_representation) ?? 0),

        commentaire: req.body.commentaire ?? row.commentaire,

        updated_at: new Date(),
      };

      await row.update(payload);
      await recalcTotals(id);

      const full = await ExpenseClaim.findByPk(id, {
        include: [
          { model: ExpenseClaimItem, as: "ClaimItems", required: false },
          {
            model: ExpenseClaimAttachment,
            as: "ClaimAttachments",
            required: false,
          },
          { model: EventBudgetCode, as: "BudgetCode", required: false },
          { model: Event, as: "ClaimEvent", required: false },
        ],
      });

      return res.json(full);
    } catch (error) {
      console.error("ExpenseClaimController.update error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // DELETE /api/expense/claims/:id
  delete: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const id = Number(req.params.id);

      const row = await ExpenseClaim.findByPk(id, { transaction: t });
      if (!row) {
        await t.rollback();
        return res.status(404).json({ message: "Fiche introuvable" });
      }

      // ✅ correction rapide :
      if (!["draft", "submitted", "rejected"].includes(row.statut)) {
        await t.rollback();
        return res.status(400).json({
          message:
            "Suppression non autorisée : seules les fiches brouillon, soumises ou rejetées peuvent être supprimées.",
        });
      }

      // supprime d'abord tous les justificatifs liés à la fiche
      await ExpenseClaimAttachment.destroy({
        where: { expense_claim_id: id },
        transaction: t,
      });

      // puis les lignes
      await ExpenseClaimItem.destroy({
        where: { expense_claim_id: id },
        transaction: t,
      });

      // puis la fiche
      await row.destroy({ transaction: t });

      await t.commit();
      return res.json({ ok: true });
    } catch (error) {
      await t.rollback();
      console.error("ExpenseClaimController.delete error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },
  // POST /api/expense/claims/:id/submit
  submit: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const row = await ExpenseClaim.findByPk(id);
      if (!row) return res.status(404).json({ message: "Fiche introuvable" });

      if (row.statut !== "draft") {
        return res.status(400).json({
          message: "Seules les fiches en brouillon peuvent être soumises.",
        });
      }

      // recalc avant submit
      await recalcTotals(id);

      await row.update({
        statut: "submitted",
        date_soumission: new Date(),
        updated_at: new Date(),
      });

      return res.json({ ok: true, id, statut: "submitted" });
    } catch (error) {
      console.error("ExpenseClaimController.submit error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // POST /api/expense/claims/:id/approve  body: { validated_by_user_id, admin_commentaire? }
  approve: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validated_by_user_id = numOrNull(req.body.validated_by_user_id);

      const row = await ExpenseClaim.findByPk(id);
      if (!row) return res.status(404).json({ message: "Fiche introuvable" });

      if (row.statut !== "submitted") {
        return res.status(400).json({
          message: "Seules les fiches soumises peuvent être approuvées.",
        });
      }

      await row.update({
        statut: "approved",
        validated_by_user_id,
        admin_commentaire: req.body.admin_commentaire || null,
        updated_at: new Date(),
      });

      return res.json({ ok: true, id, statut: "approved" });
    } catch (error) {
      console.error("ExpenseClaimController.approve error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // POST /api/expense/claims/:id/reject  body: { validated_by_user_id, admin_commentaire }
  reject: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validated_by_user_id = numOrNull(req.body.validated_by_user_id);

      const row = await ExpenseClaim.findByPk(id);
      if (!row) return res.status(404).json({ message: "Fiche introuvable" });

      if (row.statut !== "submitted") {
        return res.status(400).json({
          message: "Seules les fiches soumises peuvent être rejetées.",
        });
      }

      await row.update({
        statut: "rejected",
        validated_by_user_id,
        admin_commentaire: req.body.admin_commentaire || null,
        updated_at: new Date(),
      });

      return res.json({ ok: true, id, statut: "rejected" });
    } catch (error) {
      console.error("ExpenseClaimController.reject error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // POST /api/expense/claims/:id/mark-paid  body: { validated_by_user_id? }
  markPaid: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const row = await ExpenseClaim.findByPk(id);
      if (!row) return res.status(404).json({ message: "Fiche introuvable" });

      if (!["approved", "submitted"].includes(row.statut)) {
        return res.status(400).json({
          message:
            "La fiche doit être approuvée (ou soumise) pour être marquée payée.",
        });
      }

      await row.update({
        statut: "paid",
        validated_by_user_id:
          numOrNull(req.body.validated_by_user_id) ?? row.validated_by_user_id,
        updated_at: new Date(),
      });

      return res.json({ ok: true, id, statut: "paid" });
    } catch (error) {
      console.error("ExpenseClaimController.markPaid error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },
};

module.exports = ExpenseClaimController;
