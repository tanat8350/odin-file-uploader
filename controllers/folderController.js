const path = require('path');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { unlink } = require('fs');

const prisma = require('../config/prisma');

const validateFolder = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name is required')
    .isAlphanumeric()
    .withMessage('Name must be alphanumeric'),
];

const findFilesToDelete = async (id, files = []) => {
  const folder = await prisma.folder.findUnique({
    where: { id: id },
    include: { childrenFolders: true, files: true },
  });
  for (const item of folder.files) {
    files.push(item.id);
  }
  for (const item of folder.childrenFolders) {
    await findFilesToDelete(item.id, files);
  }
  return files;
};

module.exports = {
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
    const filesToDelete = await findFilesToDelete(+req.params.id);
    filesToDelete.forEach((file) => {
      unlink(path.join('uploads/' + file), () => {});
    });

    let redirect = '/';
    if (deleteFolder.parentFolderId) {
      redirect = `/folder/${deleteFolder.parentFolderId}`;
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
