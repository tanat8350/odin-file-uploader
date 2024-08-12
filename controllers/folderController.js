const path = require('path');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const prisma = require('../config/prisma');

const validateFolder = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name is required')
    .isAlphanumeric()
    .withMessage('Name must be alphanumeric'),
];

module.exports = {
  getRedirectRootFolder: (req, res) => {
    res.redirect('/folder/');
  },

  getRoot: asyncHandler(async (req, res) => {
    const title = 'Odin File uploader';

    if (!res.locals.currentUser) {
      res.render('folder', { title });
      return;
    }

    const [folders, files] = await Promise.all([
      prisma.folder.findMany({
        where: { userid: res.locals.currentUser.id, parentFolderId: null },
      }),
      prisma.file.findMany({
        where: { userid: res.locals.currentUser.id, folderid: null },
      }),
    ]);
    res.locals.folderid = '';
    res.render('folder', { title, folders, files });
  }),

  getFolder: asyncHandler(async (req, res, next) => {
    const folder = await prisma.folder.findUnique({
      where: { id: +req.params.id },
      include: { childrenFolders: true, files: true },
    });
    res.locals.folderid = +req.params.id;
    console.log(folder);
    res.render('folder', {
      title: folder.name,
      folders: folder.childrenFolders,
      files: folder.files,
    });
  }),

  postCreateFolder: [
    validateFolder,
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
      redirect = `/folder/${transaction[last].parentFolderId}`;
    }
    res.redirect(redirect);
  }),

  postUpdateFolder: [
    validateFolder,
    asyncHandler(async (req, res, next) => {
      const folder = {};
      req.body.rename ? (folder.name = req.body.rename) : null;
      if (req.body.move) {
        req.body.move == '0'
          ? (folder.parentFolderId = null)
          : (folder.parentFolderId = +req.body.move);
      }
      const updated = await prisma.folder.update({
        where: { id: +req.params.id },
        data: folder,
      });
      if (!updated) {
        return next({ status: 404, message: 'Fail to rename folder' });
      }
      res.redirect(`/folder/${req.params.id}`);
    }),
  ],
};
