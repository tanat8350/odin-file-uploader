const path = require('path');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const upload = require('../config/upload');
const prisma = require('../config/prisma');

const validateFileName = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  // later add file format
];

const validateFolderName = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name is required')
    .isAlphanumeric()
    .withMessage('Name must be alphanumeric'),
];

module.exports = {
  getFile: asyncHandler(async (req, res) => {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
    });
    file.uploadTime = new Date(file.uploadTime).toLocaleString();
    res.render('file', { title: file.name, file });
  }),

  postUploadFile: [
    upload.single('upload'),
    asyncHandler(async (req, res) => {
      let redirect = '/';
      const file = {
        id: req.file.filename,
        name: req.file.originalname,
        originalName: req.file.originalname,
        size: req.file.size,
        userid: res.locals.currentUser.id,
      };
      if (req.params.id) {
        file.folderid = +req.params.id;
        redirect = `/file/folder/${req.params.id}`;
      }
      const created = await prisma.file.create({
        data: file,
      });
      res.redirect(redirect);
    }),
  ],

  postDownloadFile: (req, res) => {
    res.download(path.join(__dirname, '../uploads/' + req.params.id));
  },

  postDeleteFile: asyncHandler(async (req, res, next) => {
    const deleted = await prisma.file.delete({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return next({ status: 404, message: 'Fail to delete file' });
    }

    let redirect = '/';
    if (deleted.folderid) {
      redirect = `/file/folder/${deleted.folderid}`;
    }
    res.redirect(redirect);
  }),

  postUpdateFile: [
    validateFileName,
    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);
      // later add display error msg
      if (!errors.isEmpty()) {
        return next({ status: 400, message: 'invalid file name' });
      }
      const updated = await prisma.file.update({
        where: { id: req.params.id },
        data: { name: req.body.name },
      });
      res.redirect(`/file/${req.params.id}`);
    }),
  ],

  getFolder: asyncHandler(async (req, res, next) => {
    const folder = await prisma.folder.findUnique({
      where: { id: +req.params.id },
      include: { childrenFolders: true, files: true },
    });
    res.locals.folderid = +req.params.id;
    console.log(folder);
    res.render('index', {
      title: folder.name,
      folders: folder.childrenFolders,
      files: folder.files,
    });
  }),

  postCreateFolder: [
    validateFolderName,
    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);
      // later add display error msg
      if (!errors.isEmpty()) {
        return next({ status: 400, message: 'invalid folder name' });
      }

      const folder = {
        name: req.body.name,
        userid: +res.locals.currentUser.id,
      };

      if (req.params.id) {
        folder.parentFolderId = +req.params.id;
      }
      const created = await prisma.folder.create({
        data: folder,
      });
      if (!created) {
        return next({ status: 404, message: 'Fail to create folder' });
      }
      res.redirect(created.id);
    }),
  ],

  postDeleteFolder: asyncHandler(async (req, res, next) => {
    // fix later change to folder 0 structure
    const deleteFolder = prisma.folder.delete({
      where: { id: +req.params.id },
    });
    const deleteChildrenFolders = prisma.folder.deleteMany({
      where: { parentFolderId: +req.params.id },
    });
    const deleteFiles = prisma.file.deleteMany({
      where: { folderid: +req.params.id },
    });
    const transaction = await prisma.$transaction([
      deleteChildrenFolders,
      deleteFiles,
      deleteFolder,
    ]);
    if (!transaction) {
      return next({ status: 404, message: 'Fail to delete folder' });
    }

    let redirect = '/';
    const last = transaction.length - 1;
    if (transaction[last].parentFolderId) {
      redirect = `/file/folder/${transaction[last].parentFolderId}`;
    }
    res.redirect(redirect);
  }),

  postUpdateFolder: [
    validateFolderName,
    asyncHandler(async (req, res, next) => {
      const folder = await prisma.folder.update({
        where: { id: +req.params.id },
        data: { name: req.body.rename },
      });
      if (!folder) {
        return next({ status: 404, message: 'Fail to rename folder' });
      }
      res.redirect(`/file/folder/${req.params.id}`);
    }),
  ],
};
