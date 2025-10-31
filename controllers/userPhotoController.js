// controllers/userPhotoController.js
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const Users = require("../models/Users");
const {
  UPLOADS_ROOT,
  publicToAbsolute,
  getUserPhotoFolderParts,
} = require("../services/multer-config");

function pickFormat(fmt) {
  const v = String(fmt || "webp").toLowerCase();
  return ["webp", "jpg", "jpeg", "png"].includes(v)
    ? v === "jpeg"
      ? "jpg"
      : v
    : "webp";
}

/**
 * POST /api/users/:id/photo
 * - memoryUpload.single("file")
 * - optionnel: ?format=webp|jpg|png (défaut webp)
 * - resize cover 400x400
 * - met à jour user.photoURL
 */
exports.uploadUserPhoto = async (req, res) => {
  if (!req.file) throw new Error("Aucun fichier reçu.");
  const id = req.params.id;

  const user = await Users.findByPk(id);
  if (!user) throw new Error("Utilisateur introuvable.");

  const { uploadPath, publicBase } = req; // fournis par le middleware setUserPhotoUploadPathByUserId
  const base = (req.file.originalname || "avatar").replace(/\.[^.]+$/, "");
  const ts = Date.now();
  const fmt = pickFormat(req.query?.format || req.body?.format);
  const filename = `${base}-${ts}.${fmt}`;
  const destAbs = path.join(uploadPath, filename);

  const pipeline = sharp(req.file.buffer)
    .rotate()
    .resize(400, 400, {
      fit: "cover",
      position: "center",
      withoutEnlargement: false,
    });

  if (fmt === "jpg") await pipeline.jpeg({ quality: 85 }).toFile(destAbs);
  else if (fmt === "png")
    await pipeline.png({ compressionLevel: 9 }).toFile(destAbs);
  else await pipeline.webp({ quality: 85 }).toFile(destAbs); // webp

  const publicUrl = `${publicBase}/${filename}`;
  await user.update({ photoURL: publicUrl });

  res.json({ ok: true, photoURL: publicUrl });
};

/**
 * PUT /api/users/:id/photo-url
 * body: { photoURL: "https://..." ou "/uploads/..." }
 */
exports.setUserPhotoUrl = async (req, res) => {
  const id = req.params.id;
  const { photoURL } = req.body || {};
  if (!photoURL) throw new Error("photoURL manquant.");

  const user = await Users.findByPk(id);
  if (!user) throw new Error("Utilisateur introuvable.");

  await user.update({ photoURL });
  res.json({ ok: true, photoURL });
};

/**
 * POST /api/users/:id/crop
 * body: { x, y, width, height, format?, src? }
 * - Recadre depuis src (si fourni) ou depuis user.photoURL
 * - Seule source prise en charge pour le recadrage: fichiers locaux (/uploads/…)
 * - Sortie 400x400, format = webp|jpg|png (défaut webp)
 */
exports.cropUserPhoto = async (req, res) => {
  const id = req.params.id;
  const { x, y, width, height, format, src } = req.body || {};

  const user = await Users.findByPk(id);
  if (!user) throw new Error("Utilisateur introuvable.");

  const fmt = pickFormat(format);

  // Source prioritaire: body.src, sinon la photo actuelle
  const sourceUrl = (src && String(src)) || user.photoURL || "";
  if (!sourceUrl)
    throw new Error("Aucune source d’image disponible pour le recadrage.");

  if (!sourceUrl.startsWith("/uploads/")) {
    throw new Error(
      "L’image d’origine doit être locale (/uploads/…) pour le recadrage."
    );
  }

  const inputAbs = publicToAbsolute(sourceUrl);
  if (!inputAbs) throw new Error("Chemin source invalide.");
  try {
    await fs.promises.access(inputAbs, fs.constants.R_OK);
  } catch {
    throw new Error("Fichier source introuvable côté serveur.");
  }

  const nx = Math.max(0, Math.round(Number(x)));
  const ny = Math.max(0, Math.round(Number(y)));
  const nw = Math.max(1, Math.round(Number(width)));
  const nh = Math.max(1, Math.round(Number(height)));

  if ([nx, ny, nw, nh].some((v) => Number.isNaN(v))) {
    throw new Error("x, y, width, height numériques requis.");
  }

  const { abs, publicBase } = await getUserPhotoFolderParts(String(id));
  await fs.promises.mkdir(abs, { recursive: true });

  const base = path.basename(sourceUrl, path.extname(sourceUrl)) || "avatar";
  const outName = `${base}-crop-${Date.now()}.${fmt}`;
  const outAbs = path.join(abs, outName);

  const img = sharp(inputAbs).rotate();

  // Option: s’assurer que l’extraction ne déborde pas — on peut clipper via metadata
  const meta = await img.metadata();
  const safeLeft = Math.min(
    Math.max(0, nx),
    Math.max(0, (meta.width || nw) - 1)
  );
  const safeTop = Math.min(
    Math.max(0, ny),
    Math.max(0, (meta.height || nh) - 1)
  );
  const safeWidth = Math.min(nw, (meta.width || nw) - safeLeft);
  const safeHeight = Math.min(nh, (meta.height || nh) - safeTop);

  let out = sharp(inputAbs)
    .rotate()
    .extract({
      left: safeLeft,
      top: safeTop,
      width: safeWidth,
      height: safeHeight,
    })
    .resize(400, 400, { fit: "cover", position: "center" });

  if (fmt === "jpg") await out.jpeg({ quality: 85 }).toFile(outAbs);
  else if (fmt === "png") await out.png({ compressionLevel: 9 }).toFile(outAbs);
  else await out.webp({ quality: 85 }).toFile(outAbs);

  const publicUrl = `${publicBase}/${outName}`;
  await user.update({ photoURL: publicUrl });

  res.json({ ok: true, photoURL: publicUrl });
};

/**
 * DELETE /api/users/:id/photo
 * - Si la photo actuelle est locale (/uploads/…), supprime le fichier
 * - Vide le champ photoURL
 */
exports.deleteUserPhoto = async (req, res) => {
  const id = req.params.id;

  const user = await Users.findByPk(id);
  if (!user) throw new Error("Utilisateur introuvable.");

  const url = user.photoURL || "";
  if (url.startsWith("/uploads/")) {
    const abs = path.join(UPLOADS_ROOT, url.replace(/^\/uploads\//, ""));
    try {
      await fs.promises.unlink(abs);
    } catch (_) {
      // ignore (fichier déjà manquant)
    }
  }

  await user.update({ photoURL: null });
  res.json({ ok: true });
};
