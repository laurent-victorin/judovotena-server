const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

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
   Mémoire (inchangé)
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

module.exports = { upload, localUpload, memoryUpload, uploadValidationBadge };
