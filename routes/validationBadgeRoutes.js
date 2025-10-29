const express = require("express");
const router = express.Router();

const cw = require("../controllers/controllerWrapper");
const validationBadgeController = require("../controllers/validationBadgeController");

const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Import "multer-config" sans destructuring + fallback robuste
const multerCfg = require("../services/multer-config");

// Si l’import réussit ET expose bien la fonction, on l’utilise.
// Sinon on fabrique un middleware local équivalent (fallback) pour ne pas planter.
const uploadValidationBadge =
  multerCfg && typeof multerCfg.uploadValidationBadge === "function"
    ? multerCfg.uploadValidationBadge
    : (() => {
        // === Fallback local (strictement équivalent) ===
        const ensureDir = (dir) => {
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        };
        const UPLOADS_ROOT =
          process.env.UPLOADS_ROOT && path.isAbsolute(process.env.UPLOADS_ROOT)
            ? process.env.UPLOADS_ROOT
            : path.join(__dirname, "..", process.env.UPLOADS_ROOT || "uploads");

        const dir = path.join(UPLOADS_ROOT, "validationbadge");
        ensureDir(dir);

        const storageValidationBadge = multer.diskStorage({
          destination: (req, file, cb) => cb(null, dir),
          filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const base = path
              .basename(file.originalname, ext)
              .replace(/\s+/g, "_")
              .replace(/[^a-zA-Z0-9_\-\.]/g, "");
            cb(null, `${Date.now()}_${base}${ext}`);
          },
        });
        const pdfOnlyFilter = (req, file, cb) => {
          if (file.mimetype === "application/pdf") return cb(null, true);
          cb(
            new Error(
              "Seuls les fichiers PDF sont autorisés pour l’attestation."
            )
          );
        };
        return multer({
          storage: storageValidationBadge,
          fileFilter: pdfOnlyFilter,
          limits: { fileSize: 10 * 1024 * 1024 },
        }).single("badge");
      })();

router.get(
  "/api/validationbadges/getAll",
  cw(validationBadgeController.getAll)
);
router.get(
  "/api/validationbadges/byUser/:user_id",
  cw(validationBadgeController.getByUser)
);
router.get(
  "/api/validationbadges/byClub/:club_id",
  cw(validationBadgeController.getByClub)
);
router.post(
  "/api/validationbadges/add",
  uploadValidationBadge,
  cw(validationBadgeController.add)
);
router.put(
  "/api/validationbadges/update/:id",
  uploadValidationBadge,
  cw(validationBadgeController.update)
);
router.delete(
  "/api/validationbadges/delete/:id",
  cw(validationBadgeController.remove)
);

module.exports = router;
