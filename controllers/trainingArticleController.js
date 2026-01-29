// src/controllers/trainingArticleController.js
const TrainingArticle = require("../models/TrainingArticle");

const now = () => new Date();

const normalizeCategory = (c) => {
  const v = String(c || "").trim().toUpperCase();
  if (v === "CERTIF_ASSO") return "CERTIF_ASSO";
  return "DIRIGEANTS";
};

module.exports = {
  // GET /api/training-articles?category=DIRIGEANTS|CERTIF_ASSO&published=1|0
  getAll: async (req, res) => {
    const category = req.query.category ? normalizeCategory(req.query.category) : null;
    const published =
      req.query.published === "1" ? true : req.query.published === "0" ? false : null;

    const where = {};
    if (category) where.category = category;
    if (published !== null) where.is_published = published;

    const rows = await TrainingArticle.findAll({
      where,
      order: [
        ["sort_order", "ASC"],
        ["id", "DESC"],
      ],
    });

    res.json(rows);
  },

  // GET /api/training-articles/:id
  getOne: async (req, res) => {
    const row = await TrainingArticle.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: "Article not found" });
    res.json(row);
  },

  // POST /api/training-articles
  create: async (req, res) => {
    const body = req.body || {};
    const payload = {
      category: normalizeCategory(body.category),
      title: String(body.title || "").trim(),
      subtitle: body.subtitle ? String(body.subtitle).trim() : null,
      content: String(body.content || "").trim(),
      video_url: body.video_url ? String(body.video_url).trim() : null,
      powerpoint_url: body.powerpoint_url ? String(body.powerpoint_url).trim() : null,
      is_published: body.is_published !== undefined ? !!body.is_published : true,
      sort_order: body.sort_order ? Number(body.sort_order) : 1,
      created_by_user_id: body.created_by_user_id ? Number(body.created_by_user_id) : null,
      updated_by_user_id: body.updated_by_user_id ? Number(body.updated_by_user_id) : null,
      created_at: now(),
      updated_at: now(),
    };

    if (!payload.title) return res.status(400).json({ message: "title is required" });
    if (!payload.content) return res.status(400).json({ message: "content is required" });

    const created = await TrainingArticle.create(payload);
    res.status(201).json(created);
  },

  // PUT /api/training-articles/:id
  update: async (req, res) => {
    const row = await TrainingArticle.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: "Article not found" });

    const body = req.body || {};

    if (body.category !== undefined) row.category = normalizeCategory(body.category);
    if (body.title !== undefined) row.title = String(body.title || "").trim();
    if (body.subtitle !== undefined) row.subtitle = body.subtitle ? String(body.subtitle).trim() : null;
    if (body.content !== undefined) row.content = String(body.content || "").trim();

    if (body.video_url !== undefined) row.video_url = body.video_url ? String(body.video_url).trim() : null;
    if (body.powerpoint_url !== undefined)
      row.powerpoint_url = body.powerpoint_url ? String(body.powerpoint_url).trim() : null;

    if (body.is_published !== undefined) row.is_published = !!body.is_published;
    if (body.sort_order !== undefined) row.sort_order = Number(body.sort_order) || 1;

    if (body.updated_by_user_id !== undefined)
      row.updated_by_user_id = body.updated_by_user_id ? Number(body.updated_by_user_id) : null;

    row.updated_at = now();

    if (!row.title) return res.status(400).json({ message: "title is required" });
    if (!row.content) return res.status(400).json({ message: "content is required" });

    await row.save();
    res.json(row);
  },

  // DELETE /api/training-articles/:id
  remove: async (req, res) => {
    const row = await TrainingArticle.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: "Article not found" });

    await row.destroy();
    res.json({ ok: true });
  },

  // PATCH /api/training-articles/:id/photo/:slot  (slot = 1..3)
  updatePhoto: async (req, res) => {
    const id = req.params.id;
    const slot = Number(req.params.slot);

    if (![1, 2, 3].includes(slot)) {
      return res.status(400).json({ message: "slot must be 1, 2 or 3" });
    }

    const row = await TrainingArticle.findByPk(id);
    if (!row) return res.status(404).json({ message: "Article not found" });

    const imageUrl = req.file ? req.file.path : null;
    if (!imageUrl) return res.status(400).json({ message: "No image uploaded" });

    if (slot === 1) row.photo_url_1 = imageUrl;
    if (slot === 2) row.photo_url_2 = imageUrl;
    if (slot === 3) row.photo_url_3 = imageUrl;

    row.updated_at = now();
    await row.save();

    res.json({ slot, imageUrl });
  },

  // PATCH /api/training-articles/:id/publish  { is_published: true/false }
  setPublished: async (req, res) => {
    const row = await TrainingArticle.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: "Article not found" });

    row.is_published = !!req.body?.is_published;
    row.updated_at = now();
    await row.save();

    res.json(row);
  },
};
