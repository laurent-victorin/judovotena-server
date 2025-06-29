const Users = require("../models/Users"); // Assurez-vous que le chemin d'accès est correct
const ResetPwd = require("../models/ResetPwd"); // Assurez-vous que le chemin d'accès est correct
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const passwordController = {
  forgotPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await Users.findOne({ where: { email } });
      if (!user) {
        return res.status(404).send("Utilisateur non trouvé");
      }

      const token = crypto.randomBytes(20).toString("hex");
      const expirationDate = new Date(Date.now() + 3600000); // Expire dans 1 heure

      await ResetPwd.create({
        reset_pwd_user_id: user.id,
        token,
        expiration_date: expirationDate,
      });

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
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: "Réinitialisation de votre mot de passe",
        text:
          `Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.\n\n` +
          `Veuillez cliquer sur le lien suivant, ou copiez-le dans votre navigateur pour compléter le processus :\n\n` +
          `https://www.judo-presence-pro.com/reset-password/${token}\n\n` + // Changez ici par l'URL de votre front-end
          `Si vous n'avez pas demandé cela, veuillez ignorer cet email et votre mot de passe restera inchangé.\n`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Erreur lors de l'envoi de l'email", error);
          return res.status(500).send("Erreur lors de l'envoi de l'email");
        } else {
          console.log("Email envoyé: " + info.response);
          res
            .status(200)
            .send("Un email de réinitialisation a été envoyé à " + email);
        }
      });
    } catch (error) {
      console.error(
        "Erreur lors de la demande de réinitialisation de mot de passe",
        error
      );
      res
        .status(500)
        .send("Erreur lors de la demande de réinitialisation de mot de passe");
    }
  },
};

module.exports = passwordController;
