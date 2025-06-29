const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx", // Pour les fichiers .xlsx
  "application/vnd.ms-excel": "xls", // Pour les fichiers .xls
  "text/csv": "csv", // Pour les fichiers .csv
};

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

// Configuration du stockage local
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/dossier_inscription"); // Chemin où les fichiers seront stockés
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Configuration du stockage en mémoire
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({ storage: memoryStorage });

const localUpload = multer({ storage: localStorage });

module.exports = { upload, localUpload, memoryUpload };
