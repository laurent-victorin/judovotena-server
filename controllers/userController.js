const Users = require("../models/Users");
const Club = require("../models/Club");
const Message = require("../models/Message");
const errorController = require("./errorController");
const bcrypt = require("bcrypt");
const saltRounds = 10; // Définissez le nombre de tours de salt pour bcrypt
const { Sequelize, Op } = require("sequelize");
const { fn, col } = require("sequelize");

// Ajoutez votre clé secrète JWT à vos variables d'environnement ou configurez-la ici
const JWT_SECRET = process.env.JWT_SECRET || "secret";

const ROLE_MAP = {
  1: "Administrateur",
  2: "Utilisateur",
  3: "Dirigeant Club",
  4: "Arbitre",
  5: "Responsable Arbitrage",
  6: "Membre de la Ligue NA",
  7: "Responsables Comités Départementaux",
  8: "Enseignant-Coach",
};

const userController = {
  /// GET

  // Récupérer tous les users dans l'ordre alphabétique avec nom, prénom, email, role_id, createdOn, ainsi que le club qui lui ai associé depuis Club (user_id, nom_club,departement_club)
  getAllUsersWithClub: async (req, res, next) => {
    try {
      const users = await Users.findAll({
        attributes: ["id", "nom", "prenom", "email", "role_id", "createdOn"],
        include: [
          // ⬇️ Many-to-many : tous les clubs liés à l'utilisateur
          {
            model: Club,
            as: "Clubs",
            attributes: ["id", "nom_club", "departement_club"],
            through: { attributes: [] }, // masque les colonnes de la table de jointure
            required: false,
          },
          // ⬇️ Legacy (si tu avais un belongsTo "Club" historique)
          {
            model: Club,
            as: "Club",
            attributes: ["id", "nom_club", "departement_club"],
            required: false,
          },
        ],
        order: [
          ["nom", "ASC"],
          [{ model: Club, as: "Clubs" }, "nom_club", "ASC"],
        ],
        distinct: true, // évite les doublons sur les lignes avec include
      });

      res.json(users);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour obtenir les informations de l'utilisateur connecté
  getUserInfo: async (req, res) => {
    try {
      // Récupérer l'utilisateur connecté depuis req.user (via le middleware d'authentification)
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Utilisateur non authentifié." });
      }

      // Rechercher l'utilisateur dans la base de données
      const user = await Users.findByPk(userId, {
        attributes: ["id", "nom", "prenom", "email", "role_id", "photoURL"],
      });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      // Réponse avec les données utilisateur
      res.status(200).json(user);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des informations utilisateur :",
        error
      );
      res.status(500).json({ message: "Erreur interne du serveur." });
    }
  },

  // Fonction pour obtenir un utilisateur par son ID
  getUserById: async (req, res, next) => {
    const { id } = req.params;
    try {
      const user = await Users.findByPk(id, {
        attributes: ["id", "nom", "prenom", "email", "role_id", "photoURL"],
      });

      if (user) {
        res.json(user);
      } else {
        res.status(404).send("Utilisateur non trouvé");
      }
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour afficher tous les utilisateurs par ordre alphabétique
  getAllUsersAlphabetically: async (req, res, next) => {
    try {
      const users = await Users.findAll({
        attributes: [
          "id",
          "nom",
          "prenom",
          "role_id",
          "email",
          "photoURL",
          "createdOn",
        ], // Ajout de l'email et photoURL
        order: [["createdOn", "DESC"]],
      });
      res.json(
        users.map((user) => ({
          id: user.id, // ID de l'utilisateur
          nom: user.nom, // Nom de l'utilisateur
          prenom: user.prenom, // Prénom de l'utilisateur
          role_id: user.role_id, // ID du rôle de l'utilisateur
          email: user.email, // Email de l'utilisateur
          photoURL: user.photoURL, // URL de la photo de l'utilisateur
          createdOn: user.createdOn, // Date de création de l'utilisateur
        }))
      );
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour afficher les 10 derniers utilisateurs créés du plus récent au plus ancien
  getLastTenUsers: async (req, res, next) => {
    try {
      const users = await Users.findAll({
        attributes: [
          "id",
          "nom",
          "prenom",
          "role_id",
          "email",
          "photoURL",
          "createdOn",
        ], // Ajout de l'email et photoURL
        limit: 10,
      });
      res.json(
        users.map((user) => ({
          id: user.id, // ID de l'utilisateur
          nom: user.nom, // Nom de l'utilisateur
          prenom: user.prenom, // Prénom de l'utilisateur
          role_id: user.role_id, // ID du rôle de l'utilisateur
          email: user.email, // Email de l'utilisateur
          photoURL: user.photoURL, // URL de la photo de l'utilisateur
          createdOn: user.createdOn, // Date de création de l'utilisateur
        }))
      );
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour obtenir un tableau d'id d'utilisateurs qui ont les roleId de 1 (admin)
  getAdmins: async (req, res, next) => {
    try {
      const users = await Users.findAll({
        where: {
          role_id: { [Op.in]: [1] },
        },
        attributes: ["id", "role_id"],
      });

      res.json(users);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour checker si un email est déjà utilisé
  // Retourne un booleen true si l'email est déjà utilisé, false sinon
  checkEmail: async (req, res, next) => {
    const { email } = req.query; // Utilisez req.query pour les paramètres d'URL

    try {
      const user = await Users.findOne({ where: { email } });
      if (user) {
        res.json({ exists: true });
      } else {
        res.json({ exists: false });
      }
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST

  /// PATCH
  // Fonction pour mettre à jour la photo de profil d'un utilisateur
  updateProfilePhoto: async (req, res, next) => {
    const id = req.params.id; // Assurez-vous de récupérer l'ID de l'utilisateur
    const image = req.file ? req.file.path : null;
    try {
      const user = await Users.findByPk(id);

      if (user) {
        user.photoURL = image;
        await user.save();
        res.json(user);
      } else {
        res.status(404).send("Utilisateur non trouvé");
      }
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT
  // Fonction pour mettre à jour le role d'un utilisateur
  updateUserRole: async (req, res, next) => {
    const { userId } = req.params;
    const { role_id } = req.body;

    if (!role_id) {
      return res.status(400).json({ message: "role_id est requis." });
    }

    try {
      const user = await Users.findByPk(userId);

      if (user) {
        user.role_id = role_id;
        await user.save();
        res.json(user);
      } else {
        res.status(404).send("Utilisateur non trouvé");
      }
    } catch (error) {
      next(error);
    }
  },

  /// DELETE

  /// PUT

  // Fonction pour mettre à jour les informations d'un utilisateur (nom, prénom, photoURL)
  updateUserProfile: async (req, res, next) => {
    const { userId } = req.params; // Récupère l'identifiant de l'utilisateur depuis les paramètres
    const { nom, prenom, photoURL } = req.body; // Ajout de photoURL dans les données du corps de la requête

    try {
      const user = await Users.findByPk(userId); // Cherche l'utilisateur par son ID

      if (user) {
        // Mise à jour des champs si présents dans la requête
        if (nom) user.nom = nom;
        if (prenom) user.prenom = prenom;
        if (photoURL) user.photoURL = photoURL;

        await user.save(); // Sauvegarde les modifications dans la base de données
        res.json(user); // Retourne l'utilisateur mis à jour
      } else {
        res.status(404).send("Utilisateur non trouvé");
      }
    } catch (error) {
      errorController._500(error, req, res); // Gestion des erreurs
    }
  },

  // Fonction pour mettre à jour les informations d'un utilisateur (nom, prénom, email, rôle)
  updateUserInfo: async (req, res, next) => {
    const { userId } = req.params; // Récupère l'identifiant de l'utilisateur depuis les paramètres
    const { nom, prenom, email, role_id } = req.body; // Récupère les données du corps de la requête
    try {
      const user = await Users.findByPk(userId); // Cherche l'utilisateur par son ID
      if (user) {
        // Mise à jour des champs si présents dans la requête
        if (nom) user.nom = nom;
        if (prenom) user.prenom = prenom;
        if (email) user.email = email;
        if (role_id) user.role_id = role_id; // Mise à jour du rôle
        await user.save(); // Sauvegarde les modifications dans la base de données
        res.json(user); // Retourne l'utilisateur mis à jour
      } else {
        res.status(404).send("Utilisateur non trouvé");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
      // En cas d'erreur, on utilise le contrôleur d'erreur pour gérer la réponse
      errorController._500(error, req, res);
    }
  },

  /////////////////////////////////////////////////////////////////////////////////

  getAllUsers: async (req, res, next) => {
    try {
      const userRole = req.headers["x-user-role"]; // Lire role_id des en-têtes

      let whereClause = {};

      if (userRole === "2") {
        whereClause.role_id = { [Op.in]: [1, 3] };
      }

      const users = await Users.findAll({
        where: whereClause,

        order: [
          ["nom", "ASC"],
          ["prenom", "ASC"],
        ],
      });

      res.json(users);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
  },

  addUser: async (req, res, next) => {
    const { nom, prenom, email, password, role_id } = req.body;

    try {
      // Vérifier que le rôle est valide
      const allowedRoles = [2, 3, 4, 8];
      const finalRoleId = allowedRoles.includes(role_id) ? role_id : 2;

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = await Users.create({
        nom,
        prenom,
        email,
        password: hashedPassword,
        role_id: finalRoleId,
        photoURL: "https://www.liguejudona.com/img/user_avatar.jpg",
      });

      // Message à l’admin
      // const adminUser = await Users.findOne({ where: { role_id: 1 } });
      // if (adminUser) {
      //   await Message.create({
      //     sender_id: newUser.id,
      //     recipient_id: adminUser.id,
      //     subject: "Nouvel utilisateur inscrit",
      //     content: `Un nouvel utilisateur a été créé : ${nom} ${prenom} (${email}).`,
      //     read_message: false,
      //     is_copy: false,
      //   });
      // }

      // Message de bienvenue
      // await Message.create({
      //   sender_id: adminUser ? adminUser.id : null,
      //   recipient_id: newUser.id,
      //   subject: "Bienvenue sur notre plateforme",
      //   content: `
      // <p>Bonjour ${prenom} ${nom},</p>
      // <p>Bienvenue sur notre plateforme. Nous sommes ravis de vous compter parmi nous !</p>
      // <p>Cordialement,<br />L'équipe Support.</p>
      // `,
      //   read_message: false,
      //   is_copy: false,
      // });

      return res.status(201).json({
        message: "Utilisateur créé avec succès.",
        user: newUser,
      });
    } catch (error) {
      if (!res.headersSent) {
        console.error("Erreur lors de l'ajout de l'utilisateur :", error);
        return res.status(500).json({ error: "Erreur serveur." });
      }
      next(error);
    }
  },

  // Controller pour ajouter un nouvel utilisateur avec formulaire : nom, prenom, email, role_id, created_at. On ne gère pas les adhérents ici
  addUserByAdmin: async (req, res, next) => {
    const { nom, prenom, email, role_id } = req.body;

    // Validation des données reçues
    if (
      !nom ||
      !prenom ||
      !email ||
      typeof role_id !== "number" ||
      isNaN(role_id)
    ) {
      return res.status(400).json({
        type: "Mauvaise requête",
        errors: {
          nom: !nom ? "Le nom est requis" : null,
          prenom: !prenom ? "Le prénom est requis" : null,
          email: !email ? "L'email est requis" : null,
          role_id:
            typeof role_id !== "number" || isNaN(role_id)
              ? "Le rôle doit être un nombre"
              : null,
        },
      });
    }

    // Génération d'un mot de passe par défaut (par exemple "MotDePasseTemporaire123")
    const defaultPassword = "MotDePasseTemporaire123";

    try {
      const newUser = await Users.create({
        nom,
        prenom,
        email,
        role_id,
        password: defaultPassword,
        photoURL:
          "https://res.cloudinary.com/dy5kblr32/image/upload/v1715177107/images/utilisateurs/user_avatar_ecd77h.jpg", // URL de photo par défaut
      });

      res.status(201).json({
        user: newUser,
        message: "Utilisateur créé avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      res.status(400).json({
        message: "Erreur lors de la création de l'utilisateur",
        error,
      });
    }
  },

  countUsers: async (req, res) => {
    try {
      const total = await Users.count();

      // group by role_id
      const grouped = await Users.findAll({
        attributes: ["role_id", [fn("COUNT", col("id")), "count"]],
        group: ["role_id"],
        raw: true,
      });

      // normalise -> ensure every role 1..8 is present
      const byId = Object.fromEntries(
        grouped.map((r) => [Number(r.role_id), Number(r.count)])
      );
      const roles = Object.entries(ROLE_MAP).map(([id, label]) => ({
        role_id: Number(id),
        role_label: label,
        count: byId[Number(id)] || 0,
      }));

      res.json({ total, roles });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour compter le nombre d'utilisateurs inscrits aujourd'hui
  countUsersToday: async (req, res, next) => {
    try {
      const userCount = await Users.count({
        where: Sequelize.where(
          Sequelize.fn("DATE", Sequelize.col("createdOn")),
          Sequelize.fn("CURDATE")
        ),
      });
      res.json({ count: userCount });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  loginUser: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await Users.findOne({ where: { email } });
      if (!user) {
        return res.status(404).send("Utilisateur non trouvé");
      }

      // Vérifier le mot de passe
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).send("Mot de passe incorrect");
      }

      // Générer un token JWT
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
          email: user.email,
          role_id: user.role_id,
          photoURL:
            user.photoURL ||
            "https://res.cloudinary.com/dy5kblr32/image/upload/v1715177107/images/utilisateurs/user_avatar_ecd77h.jpg",
          userId: user.id,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      res.status(500).send("Erreur lors de la connexion");
    }
  },

  ///DELETE
  // Fonction pour supprimer un utilisateur
  deleteUser: async (req, res, next) => {
    const { userId } = req.params; // Utilisez userId au lieu de id
    try {
      const user = await Users.findByPk(userId); // Utilisez userId ici aussi
      if (user) {
        await user.destroy();
        res.send("Utilisateur supprimé");
      } else {
        res.status(404).send("Utilisateur non trouvé");
      }
    } catch (error) {
      errorController._500(error, req, res);
    }
  },
};

module.exports = userController;
