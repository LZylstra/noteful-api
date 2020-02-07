const express = require("express");
const NotesService = require("./notes-service");

const notesRouter = express.Router();
const bodyParser = express.json();

const serializeNote = note => ({
  id: note.id,
  note_name: note.note_name,
  date_modified: note.date_modified,
  content: note.content,
  folderid: note.folderid
});

notesRouter
  .route("/notes")
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get("db"))
      .then(notes => {
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { note_name, folderid, content, date_modified } = req.body;
    const newNote = { note_name, folderid, content, date_modified };

    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key} in request body` }
        });
      }
    }

    NotesService.insertNote(req.app.get("db"), newNote)
      .then(note => {
        res
          .status(201)
          .location(`notes/${note.id}`)
          .json(serializeNote(note));
      })
      .catch(next);
  });

notesRouter
  .route("/notes/:id")
  .all((req, res, next) => {
    NotesService.getNoteById(req.app.get("db"), req.params.id)
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note does not exist` }
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    const { id } = req.params;

    NotesService.deleteNote(req.app.get("db"), id)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;
