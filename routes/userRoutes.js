const express = require("express");

const Users = require("../models/Users");
const router = express.Router();
const userController = require("../controllers/userController");
const userPhotoController = require("../controllers/userPhotoController"); // ⬅️ remis tel quel
const passwordController = require("../controllers/passwordController");
const cw = require("../controllers/controllerWrapper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const ResetPwd = require("../models/ResetPwd");
require("dotenv").config(); // Pour utiliser les variables d'environnement
const { Op } = require("sequelize");
const {
  upload, // Cloudinary
  setUserPhotoUploadPathByUserId, // chemin local avatars
  memoryUpload, // mémoire générique (comme ancien code)
} = require("../services/multer-config");

//// userController.js
/// GET

// Route pour obtenir tous les utilisateurs avec leur club
router.get(
  "/api/users/allUsersWithClub",
  cw(userController.getAllUsersWithClub)
);

// Route pour obtenir les informations de l'utilisateur connecté
router.get("/api/users/getUserInfo", cw(userController.getUserInfo));

// Route pour afficher les utilisateurs par ordre alphabétique (Messaging)
router.get("/api/users/allusers", cw(userController.getAllUsersAlphabetically));

// Route pour obtenir les 10 derniers utilisateurs inscrits
router.get("/api/users/lastTenUsers", cw(userController.getLastTenUsers));

// Route pour obtenir un utilisateur par son id
router.get("/api/users/oneUser/:id", cw(userController.getUserById));

// Route pour obtenir un tableau d'id d'utilisateurs qui ont les roleId de 1 (admin)
router.get("/api/users/getAdmins", cw(userController.getAdmins));

// Route pour obtenir le nombre total d'utilisateurs
router.get("/api/users/countUsers", cw(userController.countUsers));

// Route pour compter le nombre d'utilisateurs inscrits aujourd'hui
router.get("/api/users/countUsersToday", cw(userController.countUsersToday));

/// POST
// Route pour se connecter sur l'application avec email et mot de passe
router.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    // Vérifiez si le mot de passe hashé est présent
    if (!user.password) {
      return res.status(500).send("Mot de passe non défini pour l'utilisateur");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send("Mot de passe incorrect");
    }

    // Génération du token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Inclure les informations utilisateur dans la réponse
    res.json({
      message: "Connexion réussie",
      token,
      userInfo: {
        nom: user.nom,
        prenom: user.prenom,
        photoURL:
          user.photoURL ||
          "https://res.cloudinary.com/dy5kblr32/image/upload/v1715177107/images/utilisateurs/user_avatar_ecd77h.jpg",
        role_id: user.role_id || 3,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).send("Erreur lors de la connexion");
  }
});

// Route pour ajouter un utilisateur
router.post("/api/users/register", userController.addUser);

// Route pour checker si un email est déjà utilisé
router.get("/api/users/checkEmail", cw(userController.checkEmail));

// Route pour la réponse du formulaire de contact
router.get("/api/users/send-contact-form", async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // smtp.hostinger.com
    port: parseInt(process.env.EMAIL_PORT), // 587
    secure: false, // important: false pour le port 587
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: email, // Vous voudrez peut-être utiliser une adresse vérifiée comme expéditeur
    to: "monappliclub@gmail.com",
    subject: `Formulaire de Contact du site USB Judo : Message de ${name}`,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Erreur lors de l'envoi de l'email : ", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'envoi du message",
        error: error.toString(),
      });
    } else {
      console.log("Email envoyé : " + info.response);
      res.status(200).json({ success: true, message: "Message envoyé" });
    }
  });
});

/* ===========================================================
   🖼️ AVATARS — mêmes endpoints que ton ancien code
   =========================================================== */

/**
 * Upload avatar local (sharp 400x400 cover)
 * - multipart/form-data, champ "file"
 * - optionnel: body|query.format = webp|jpg|png (défaut: webp)
 * - renvoie: { ok:true, photoURL:"/uploads/photos_users/<...>.ext" }
 */
router.post(
  "/api/users/:id/photo",
  setUserPhotoUploadPathByUserId,
  memoryUpload.single("file"),
  cw(userPhotoController.uploadUserPhoto)
);

/**
 * Définir directement une URL existante (Cloudinary ou locale)
 * body: { photoURL: "https://..." ou "/uploads/..." }
 */
router.put(
  "/api/users/:id/photo-url",
  cw(userPhotoController.setUserPhotoUrl)
);

/**
 * Recadrer l’avatar (coords x/y/width/height), sortie 400x400
 * body: { x, y, width, height, format?, src? }
 */
router.post(
  "/api/users/:id/crop",
  cw(userPhotoController.cropUserPhoto)
);

/**
 * Supprimer l’avatar (vide le champ et, si local, supprime le fichier)
 */
router.delete(
  "/api/users/:id/photo",
  cw(userPhotoController.deleteUserPhoto)
);

// Route Cloudinary (legacy / rétro-compat)
router.patch(
  "/api/users/:id/photo",
  upload("/JUDOCOACHPRO/user").single("image"),
  cw(userController.updateProfilePhoto)
);

// Route pour ajouter un utilisateur
router.post("/api/users/addUser", cw(userController.addUser));

// Route pour ajouter un utilisateur depuis dashboard admin
router.post("/api/users/addUserByAdmin", cw(userController.addUserByAdmin));

/// PATCH
// Route pour mettre à jour la photo de profile de l'utilisateur (legacy direct)
router.patch("/api/users/:userId/updateProfileImage", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    if (!req.file) {
      return res.status(400).send("Aucun fichier téléchargé");
    }

    const imageUrl = req.file.path;
    await user.update({ photoURL: imageUrl });
    res.json({
      success: true,
      message: "Image de profil mise à jour",
      imageUrl,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'image de profil :",
      error
    );
    res.status(500).send("Erreur lors de la mise à jour de l'image de profil");
  }
});

// Route pour mettre à jour les informations de l'utilisateur
router.patch(
  "/api/users/:userId/updateUserProfile",
  cw(userController.updateUserProfile)
);

/// PUT

// Route pour mettre à jour le role d'un utilisateur
router.put("/api/users/:userId/updateRole", cw(userController.updateUserRole));

// Route pour mettre à jour le nom, prenom, email et rôle d'un utilisateur
router.put(
  "/api/users/:userId/updateUserInfo",
  cw(userController.updateUserInfo)
);

/// DELETE
// Route pour supprimer un utilisateur
router.delete("/api/users/:userId/deleteUser", cw(userController.deleteUser));

/////////////////////////////////////////////////////////////////////////

//// passwordController.js

/// POST
// Route pour le mot de passe oublié
router.post("/password/forgot-password", cw(passwordController.forgotPassword));

// Route get pour réinitialiser le mot de passe
router.get("/password/check-token/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const resetPwdEntry = await ResetPwd.findOne({
      where: {
        token,
        expiration_date: { [Op.gt]: new Date() },
      },
    });

    if (!resetPwdEntry) {
      return res.status(400).json({
        valid: false, // Ajout d'un champ "valid" pour la cohérence
        message: "Token invalide ou expiré",
        redirectUrl:
          "https://www.judo-presence-pro.com/error-page?error=Token invalide ou expiré",
      });
    }

    res.json({
      valid: true, // Confirmation que le token est valide
      redirectUrl: `https://www.judo-presence-pro.com/reset-password/${token}`,
    });
  } catch (error) {
    console.error("Erreur serveur lors de la vérification du token:", error);
    res.status(500).json({
      valid: false,
      message: "Erreur serveur lors de la vérification du token",
    });
  }
});

// Route post pour réinitialiser le mot de passe
router.post("/password/reset-password/:token", async (req, res) => {
  console.log("Received token:", req.params.token); // Log du token reçu
  console.log("Received password:", req.body.password); // Log du mot de passe reçu
  const { token } = req.params;
  const { password } = req.body; // Nouveau mot de passe fourni par l'utilisateur

  try {
    // Rechercher l'entrée de réinitialisation du mot de passe par token et vérifier qu'elle n'est pas expirée
    const resetPwdEntry = await ResetPwd.findOne({
      where: {
        token,
        expiration_date: { [Op.gt]: new Date() }, // Vérifier que le token n'est pas expiré
      },
    });

    if (!resetPwdEntry) {
      return res
        .status(400)
        .send("Token de réinitialisation invalide ou expiré.");
    }

    // Trouver l'utilisateur associé à cette demande de réinitialisation
    const user = await Users.findByPk(resetPwdEntry.reset_pwd_user_id);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé.");
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe de l'utilisateur
    await user.update({ password: hashedPassword });

    // Optionnel : supprimer l'entrée de réinitialisation du mot de passe pour nettoyer
    await resetPwdEntry.destroy();

    res.send("Mot de passe réinitialisé avec succès.");
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe", error);
    res.status(500).send("Erreur lors de la réinitialisation du mot de passe.");
  }
});

/////////////////////////////////////////////////////////////////////////

router.get("/api/getUsers", cw(userController.getAllUsers));
router.get("/api/getUser/:id", cw(userController.getUserById));

// Route pour valider un token et récupérer les informations de l'utilisateur
router.get("/api/validateToken", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // sécurisé
  if (!token) {
    return res.status(401).send("Aucun token fourni.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé.");
    }

    // Si l'utilisateur est trouvé, renvoie ses informations (sans le mot de passe)
    res.json({
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      photoURL:
        user.photoURL ||
        "https://res.cloudinary.com/dy5kblr32/image/upload/v1715177107/images/utilisateurs/user_avatar_ecd77h.jpg",
      role_id: user.role_id,
    });
  } catch (error) {
    console.error("Erreur lors de la validation du token :", error);
    res.status(500).send("Erreur de validation du token.");
  }
});

module.exports = router;
