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
const Commissions = require("./Commissions");
const TeamLigue = require("./TeamLigue");
const ArticlesCommissions = require("./ArticlesCommissions");
const Annonces = require("./Annonces");
const usersTechniques = require("./UsersTechniques");
const Techniques = require("./Techniques");
const Event = require("./Event");
const UsersEvents = require("./UsersEvents");
const ValidationBadge = require("./ValidationBadge");
const UserClub = require("./UserClub");
const LicencieEvent = require("./LicencieEvent");
const Licencies = require("./Licencies");

// N:N
Licencies.belongsToMany(Event, {
  through: LicencieEvent,
  foreignKey: "licencie_id",
  otherKey: "event_id",
  as: "Events",
});

Event.belongsToMany(Licencies, {
  through: LicencieEvent,
  foreignKey: "event_id",
  otherKey: "licencie_id",
  as: "Participants",
});

// Pour les include directs sur la table pivot
LicencieEvent.belongsTo(Licencies, { foreignKey: "licencie_id", as: "Licencie" });
LicencieEvent.belongsTo(Event, { foreignKey: "event_id", as: "Event" });

Licencies.hasMany(LicencieEvent, { foreignKey: "licencie_id", as: "LicencieEvents" });
Event.hasMany(LicencieEvent, { foreignKey: "event_id", as: "EventLinks" });

// Many-to-many
Users.belongsToMany(Club, {
  through: UserClub,
  foreignKey: "user_id",
  otherKey: "club_id",
  as: "Clubs",
});

Club.belongsToMany(Users, {
  through: UserClub,
  foreignKey: "club_id",
  otherKey: "user_id",
  as: "Members",
});

// Liens pivot -> côté “parent” (nécessaire pour include direct sur UserClub)
UserClub.belongsTo(Users, { foreignKey: "user_id", as: "User" });
UserClub.belongsTo(Club,  { foreignKey: "club_id", as: "Club" });

Users.hasMany(UserClub, { foreignKey: "user_id", as: "UserClubs" });
Club.hasMany(UserClub,  { foreignKey: "club_id", as: "ClubLinks" });

// Un utilisateur (enseignant) peut avoir plusieurs badges
Users.hasMany(ValidationBadge, {
  foreignKey: "user_id",
  as: "ValidationBadges",
});
ValidationBadge.belongsTo(Users, {
  foreignKey: "user_id",
  as: "User",
});

// Un club peut recevoir plusieurs badges (d’enseignants différents)
Club.hasMany(ValidationBadge, {
  foreignKey: "club_id",
  as: "ValidationBadges",
});
ValidationBadge.belongsTo(Club, {
  foreignKey: "club_id",
  as: "Club",
});

// Association entre Users et Events
Users.belongsToMany(Event, {
  through: UsersEvents,
  foreignKey: "user_id",
  otherKey: "event_id",
  as: "Events",
});

Event.belongsToMany(Users, {
  through: UsersEvents,
  foreignKey: "event_id",
  otherKey: "user_id",
  as: "Users",
});

// Association entre User et Techniques
Users.belongsToMany(Techniques, {
  through: usersTechniques,
  foreignKey: "user_id",
  otherKey: "technique_id",
  as: "Techniques",
});

Techniques.belongsToMany(Users, {
  through: usersTechniques,
  foreignKey: "technique_id",
  otherKey: "user_id",
  as: "Users",
});

// Association entre Annonces et Users
Annonces.belongsTo(Users, {
  foreignKey: "user_id",
  as: "user",
});

// Associations entre ArticlesCommissions et Commissions
// Une commission peut avoir plusieurs articles
// Un article appartient à une seule commission
ArticlesCommissions.belongsTo(Commissions, {
  foreignKey: "commission_id", // Clé étrangère dans ArticlesCommissions pointant vers Commissions
  as: "commission", // Alias pour cette association
});

Commissions.hasMany(ArticlesCommissions, {
  foreignKey: "commission_id", // Clé étrangère dans ArticlesCommissions pointant vers Commissions
  as: "articles", // Alias pour cette association
});

// Associations entre Commissions et TeamLigue
// Une commission peut avoir plusieurs membres d'équipe
// Un membre d'équipe peut appartenir à plusieurs commissions
Commissions.hasMany(TeamLigue, {
  foreignKey: "commission_id", // Clé étrangère dans TeamLigue pointant vers Commissions
  as: "members", // Alias pour cette association
});

TeamLigue.belongsTo(Commissions, {
  foreignKey: "commission_id", // Clé étrangère dans TeamLigue pointant vers Commissions
  as: "commission", // Alias pour cette association
});

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
