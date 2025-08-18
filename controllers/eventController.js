const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const Event = require("../models/Event");
const UsersEvents = require("../models/UsersEvents");
const errorController = require("./errorController");
const { Op } = require("sequelize");

const eventController = {
  /// GET

  // Controller pour afficher tous les événements, classés par date de début
  getAllEvents: async (req, res, next) => {
    try {
      const events = await Event.findAll({
        order: [["start", "ASC"]],
      });
      res.json(events);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  // Controller pour créer un événement
  createEvent: async (req, res, next) => {
    // Récupération de tous les champs depuis req.body
    const {
      titre,
      description,
      start,
      end,
      type_event,
      level_event,
      cate_event,
      lieu_event,
      horaire_event,
      photo_url,
      agenda_url,
      organisateur,
      is_active,
    } = req.body;

    try {
      // Création du nouvel événement avec tous les champs
      const newEvent = await Event.create({
        titre,
        description,
        start,
        end,
        type_event,
        level_event,
        cate_event,
        lieu_event,
        horaire_event,
        photo_url,
        agenda_url,
        organisateur,
        is_active,
      });

      res.status(201).json(newEvent);
    } catch (error) {
      errorController._400(error, req, res);
    }
  },

  uploadEvents: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("Aucun fichier n'a été téléchargé.");
      }

      // Lire le fichier directement à partir du buffer
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const events = xlsx.utils.sheet_to_json(sheet);

      for (const eventData of events) {
        if (!eventData.id) {
          // Créer un nouvel événement si l'ID est absent
          await Event.create({
            titre: eventData.titre,
            description: eventData.description,
            start: new Date((eventData.start - 25569) * 86400 * 1000), // Convertir la date Excel en JavaScript
            end: new Date((eventData.end - 25569) * 86400 * 1000), // Convertir la date Excel en JavaScript
            type_event: eventData.type_event,
            level_event: eventData.level_event,
            cate_event: eventData.cate_event,
            lieu_event: eventData.lieu_event,
            horaire_event: eventData.horaire_event,
            photo_url: eventData.photo_url,
            agenda_url: eventData.agenda_url,
            organisateur: eventData.organisateur,
            is_active: eventData.is_active === "true",
          });
          console.log("Nouvel événement créé :", eventData.titre);
        } else {
          // Mettre à jour l'événement existant
          const [event, created] = await Event.findOrCreate({
            where: { id: eventData.id },
            defaults: {
              titre: eventData.titre,
              description: eventData.description,
              start: new Date((eventData.start - 25569) * 86400 * 1000), // Convertir la date Excel en JavaScript
              end: new Date((eventData.end - 25569) * 86400 * 1000), // Convertir la date Excel en JavaScript
              type_event: eventData.type_event,
              level_event: eventData.level_event,
              cate_event: eventData.cate_event,
              lieu_event: eventData.lieu_event,
              horaire_event: eventData.horaire_event,
              photo_url: eventData.photo_url,
              agenda_url: eventData.agenda_url,
              organisateur: eventData.organisateur,
              is_active: eventData.is_active === "true",
            },
          });

          if (!created) {
            await event.update(eventData);
            console.log("Événement mis à jour :", eventData.titre);
          }
        }
      }

      res.status(200).send("Événements ajoutés ou mis à jour avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'importation des événements:", error);
      res.status(500).send("Erreur lors de l'importation des événements.");
    }
  },

  /// PUT
  // Controller pour éditer un événement
  editEvent: async (req, res, next) => {
    const { id } = req.params;
    const {
      titre,
      description,
      start,
      end,
      type_event,
      level_event,
      cate_event,
      lieu_event,
      horaire_event,
      photo_url,
      agenda_url,
      organisateur,
      is_active,
    } = req.body;
    try {
      const event = await Event.findByPk(id);
      if (event) {
        event.titre = titre;
        event.description = description;
        event.start = start;
        event.end = end;
        event.type_event = type_event;
        event.level_event = level_event;
        event.cate_event = cate_event;
        event.lieu_event = lieu_event;
        event.horaire_event = horaire_event;
        event.photo_url = photo_url;
        event.agenda_url = agenda_url;
        event.organisateur = organisateur;
        event.is_active = is_active;

        await event.save();
        res.json(event);
      }
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Controller pour toggle is_active d'un événement
  activeEvent: async (req, res, next) => {
    const { id } = req.params;
    try {
      const event = await Event.findByPk(id);
      if (event) {
        event.is_active = !event.is_active;
        await event.save();
        res.json({
          message: "Event active status updated",
          is_active: event.is_active,
        });
      } else {
        res.status(404).send({ message: "Event not found" });
      }
    } catch (error) {
      console.error("Error updating event active status:", error);
      res.status(500).send({ message: "Internal server error", error });
    }
  },

  /// PATCH
  // Controller pour modifier la photo d'un événement
  updateEventPhoto: async (req, res, next) => {
    const id = req.params.id;
    const imageUrl = req.file ? req.file.path : null;
    try {
      const event = await Event.findByPk(id);
      if (event) {
        event.photo_url = imageUrl;
        await event.save();
        res.json({ imageUrl });
      } else {
        res.status(404).send({ message: "Event not found" });
      }
    } catch (error) {
      console.error("Error updating event photo:", error);
      res.status(500).send({ message: "Internal server error", error });
    }
  },

  /// DELETE
  // Suppression d'un événement par son id
  // et supprimer également tous les enregistrements de AdherentEvent liés à cet événement
  // ainsi que le favori de tous les adhérents liés à cet événement avec UsersEvents
  deleteEvent: async (req, res, next) => {
    const { id } = req.params;
    try {
      const event = await Event.findByPk(id);
      if (event) {
        // Supprimer les enregistrements dans UsersEvents liés à cet événement
        await UsersEvents.destroy({ where: { event_id: id } });

        // Ensuite, supprimer l'événement lui-même
        await event.destroy();

        res.json({
          message: `L'événement avec l'id ${id} a été supprimé ainsi que tous les enregistrements associés.`,
        });
      } else {
        errorController._404(req, res);
      }
    } catch (error) {
      errorController._500(error, req, res);
    }
  },
};

module.exports = eventController;
