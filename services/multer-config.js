const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const sharp = require("sharp");           // utile si besoin d'autres traitements
const slugify = require("slugify");       // pour slugs dossiers users

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =========================
   Helpers & constantes
   ========================= */
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

// Racine des uploads locaux (propre en dev & en prod/VPS)
const UPLOADS_ROOT =
  process.env.UPLOADS_ROOT || path.join(__dirname, "..", "uploads");

// Dossier spécifique aux badges
const VALIDATION_BADGE_DIR = path.join(UPLOADS_ROOT, "validationbadge");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-excel": "xls",
  "text/csv": "csv",
  // Note: on n’ajoute PAS le PDF ici volontairement,
  // car Cloudinary (storage par défaut) est en resource_type "image".
  // Les PDF passent par le stockage local dédié ci-dessous.
};

/* =========================
   Cloudinary (images / tableurs)
   ========================= */
const storage = function (folder) {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      format: (req, file) => MIME_TYPES[file.mimetype] || "jpg",
      public_id: (req, file) =>
        file.originalname.split(" ").join("_") + Date.now(),
    },
  });
};

const upload = function (folder) {
  return multer({ storage: storage(folder) });
};

/* =========================
   Local disk storage générique (amélioré)
   ========================= */
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(UPLOADS_ROOT, "dossier_inscription");
    ensureDir(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\-\.]/g, "");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});

const localUpload = multer({ storage: localStorage });

/* =========================
   Mémoire (générique)
   ========================= */
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({ storage: memoryStorage });

/* =========================
   Local disk storage — ValidationBadge (PDF only)
   ========================= */
const storageValidationBadge = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureDir(VALIDATION_BADGE_DIR);
    cb(null, VALIDATION_BADGE_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase(); // .pdf attendu
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\-\.]/g, "");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const pdfOnlyFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") return cb(null, true);
  cb(new Error("Seuls les fichiers PDF sont autorisés pour l’attestation."));
};

const uploadValidationBadge = multer({
  storage: storageValidationBadge,
  fileFilter: pdfOnlyFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo
}).single("badge"); // name du champ fichier côté front: "badge"

/* =========================
   🔵 Users (avatars) — dossiers & chemins
   ========================= */

/**
 * Dossier par utilisateur :
 * /uploads/photos_users/<id>_<prenom-nom-ou-identifiant>/
 * → retourne { folderSlug, abs, publicBase }
 */
async function getUserPhotoFolderParts(userId) {
  const Users = require("../models/Users"); // lazy require
  let folderSlug = String(userId);
  try {
    const u = await Users.findByPk(userId);
    if (u) {
      const display =
        `${u.prenom || ""} ${u.nom || ""}`.trim() ||
        u.username ||
        u.pseudo ||
        u.login ||
        u.email ||
        "";
      if (display) {
        folderSlug += "_" + slugify(display, { lower: true, strict: true });
      }
    }
  } catch (_) {}
  const abs = path.join(UPLOADS_ROOT, "photos_users", folderSlug);
  const publicBase = `/uploads/photos_users/${folderSlug}`;
  return { folderSlug, abs, publicBase };
}

async function ensureUserPhotoFolderByUserId(userId) {
  const { abs } = await getUserPhotoFolderParts(String(userId));
  ensureDir(abs);
  return abs;
}

/**
 * Middleware à placer AVANT l’upload mémoire :
 * - lit user_id dans params/body
 * - prépare req.uploadPath (absolu) + req.publicBase (URL publique)
 */
async function setUserPhotoUploadPathByUserId(req, res, next) {
  try {
    const userId = req.params.id || req.body?.user_id || req.body?.id;
    if (!userId) return next(new Error("ID de l’utilisateur manquant."));
    const { abs, publicBase } = await getUserPhotoFolderParts(String(userId));
    ensureDir(abs);
    req.uploadPath = abs;        // chemin absolu d’écriture
    req.publicBase = publicBase; // base publique pour construire l’URL
    next();
  } catch (err) {
    next(err);
  }
}

/* =========================
   🔧 Utilitaire chemin public -> absolu (pour crop/delete)
   ========================= */
function publicToAbsolute(publicPath) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return null;
  const relative = publicPath.replace(/^\/uploads\//, "");
  return path.join(UPLOADS_ROOT, relative);
}


// =========================
// Local disk storage — Expense Attachments (images + PDF)
// =========================
const EXPENSE_ATTACHMENTS_DIR = path.join(UPLOADS_ROOT, "expense_attachments");

const storageExpenseAttachments = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureDir(EXPENSE_ATTACHMENTS_DIR);
    cb(null, EXPENSE_ATTACHMENTS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\-\.]/g, "");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});

const expenseAttachmentFilter = (req, file, cb) => {
  const ok = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ].includes(file.mimetype);

  if (!ok) return cb(new Error("Type de fichier non autorisé (PDF / images uniquement)."));
  cb(null, true);
};

const uploadExpenseAttachment = multer({
  storage: storageExpenseAttachments,
  fileFilter: expenseAttachmentFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 Mo
});


/* =========================
   Exports
   ========================= */
module.exports = {
  // Cloudinary & uploads
  upload,
  localUpload,
  memoryUpload,
  uploadValidationBadge,
  uploadExpenseAttachment,

  // Users (avatars)
  setUserPhotoUploadPathByUserId,
  ensureUserPhotoFolderByUserId,
  getUserPhotoFolderParts,

  // Tools
  publicToAbsolute,
  UPLOADS_ROOT,
};
