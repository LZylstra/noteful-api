const express = require("express");
//const logger = require('../logger')
const FoldersService = require("./folders-service");

const foldersRouter = express.Router();
const bodyParser = express.json();

const serializefolder = folder => ({
  id: folder.id,
  folder_name: folder.folder_name
});

foldersRouter
  .route("/folders")
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get("db"))
      .then(folders => {
        res.json(folders.map(serializefolder));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { folder_name } = req.body;
    const newFolder = { folder_name };
    // console.log(newFolder)
    if (!folder_name) {
      return res.status(400).send(`Folder name is required`);
    }

    FoldersService.insertFolder(req.app.get("db"), newFolder)
      .then(folder => {
        res
          .status(201)
          .location(`folders/${folder.id}`)
          .json(serializefolder);
      })
      .catch(next);
  });
foldersRouter
  .route("/folders/:id")
  .all((req, res, next) => {
    FoldersService.getFolderById(req.app.get("db"), req.params.id)
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `Folder does not exist` }
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializefolder(res.folder));
  })
  .delete((req, res, next) => {
    const { id } = req.params;

    FoldersService.deleteFolder(req.app.get("db"), id)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;
