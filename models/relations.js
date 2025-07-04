const Users = require("./Users"); // Importez le modèle de la table de jonction
const Role = require("./Role");
const Message = require("./Message"); // Importez votre modèle Message
const ResetPwd = require("./ResetPwd");
const Club = require("./Club");
const Vote = require("./Vote");
const Question = require("./Question");
const Choice = require("./Choice");
const Ballot = require("./Ballot");
const UserVoteToken = require("./UserVoteToken");

// Associations entre Club et User
// Un club appartient à un utilisateur
// Un utilisateur ne peut avoir plusieurs clubs
Club.belongsTo(Users, {
  foreignKey: "user_id",
  as: "user",
});

Users.hasOne(Club, {
  foreignKey: "user_id",
  as: "Club", // ⚠️ doit correspondre au `as` utilisé dans le `include`
});

// Association entre Users et Role
Users.belongsTo(Role, {
  foreignKey: "role_id", // Clé étrangère dans Users pointant vers Role
  as: "Role", // Alias pour cette association
});

Role.hasMany(Users, {
  foreignKey: "role_id", // Clé étrangère dans Users pointant vers Role
  as: "Users", // Alias pour cette association
});

// Un utilisateur peut envoyer plusieurs messages
Users.hasMany(Message, {
  foreignKey: "sender_id",
  as: "SentMessages",
});

// Un utilisateur peut recevoir plusieurs messages
Users.hasMany(Message, {
  foreignKey: "recipient_id",
  as: "ReceivedMessages",
});

// Chaque message est associé à un utilisateur en tant qu'expéditeur
Message.belongsTo(Users, {
  foreignKey: "sender_id",
  as: "Sender",
});

// Chaque message est associé à un utilisateur en tant que destinataire
Message.belongsTo(Users, {
  foreignKey: "recipient_id",
  as: "Recipient",
});

// Relation entre User et ResetPwd
ResetPwd.belongsTo(Users, { foreignKey: "reset_pwd_user_id" });
Users.hasMany(ResetPwd, { foreignKey: "reset_pwd_user_id" });


////////////////////////////
// VOTE ET SONDAGES
///////////////////////////

/*
  🔗 Association entre Vote et Question
  - Un vote (scrutin ou sondage) peut contenir plusieurs questions.
  - Une question appartient à un seul vote.
*/
Vote.hasMany(Question, {
  foreignKey: "vote_id",
  as: "questions",
});

Question.belongsTo(Vote, {
  foreignKey: "vote_id",
  as: "vote",
});

/*
  🔗 Association entre Question et Choice
  - Une question peut avoir plusieurs choix de réponse.
  - Un choix appartient à une seule question.
*/
Question.hasMany(Choice, {
  foreignKey: "question_id",
  as: "choices",
});

Choice.belongsTo(Question, {
  foreignKey: "question_id",
  as: "question",
});

/*
  🔗 Association entre Vote et UserVoteToken
  - Un vote peut être envoyé à plusieurs utilisateurs (tokens d'accès).
  - Chaque token est lié à un seul vote.
*/
Vote.hasMany(UserVoteToken, {
  foreignKey: "vote_id",
  as: "tokens",
});

UserVoteToken.belongsTo(Vote, {
  foreignKey: "vote_id",
  as: "vote",
});

/*
  🔗 Association entre Vote et Ballot
  - Un vote peut générer plusieurs bulletins (ballots).
  - Un ballot appartient à un seul vote.
*/
Vote.hasMany(Ballot, {
  foreignKey: "vote_id",
  as: "ballots",
});

Ballot.belongsTo(Vote, {
  foreignKey: "vote_id",
  as: "vote",
});

/*
  🔗 Association entre Question et Ballot
  - Une question peut être présente dans plusieurs bulletins.
  - Un ballot est associé à une seule question.
*/
Question.hasMany(Ballot, {
  foreignKey: "question_id",
  as: "ballots",
});

Ballot.belongsTo(Question, {
  foreignKey: "question_id",
  as: "question",
});

/*
  🔗 Association entre Choice et Ballot
  - Un choix peut apparaître dans plusieurs bulletins (si plusieurs personnes ont choisi la même option).
  - Un ballot enregistre un choix fait par un utilisateur.
*/
Choice.hasMany(Ballot, {
  foreignKey: "choice_id",
  as: "ballots",
});

Ballot.belongsTo(Choice, {
  foreignKey: "choice_id",
  as: "choice",
});