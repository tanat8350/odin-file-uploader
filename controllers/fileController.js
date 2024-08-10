const path = require('path');
const asyncHandler = require('express-async-handler');

const upload = require('../config/upload');
const prisma = require('../config/prisma');

module.exports = {
  getFile: asyncHandler(async (req, res) => {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
    });
    file.uploadTime = new Date(file.uploadTime).toLocaleString();
    res.render('file', { title: file.originalName, file });
  }),

  postUpload: [
    upload.single('upload'),
    asyncHandler(async (req, res) => {
      const created = await prisma.file.create({
        data: {
          id: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          userid: res.locals.currentUser.id,
        },
      });
      console.log(created);
      res.redirect('/');
    }),
  ],

  postDownload: (req, res) => {
    res.download(path.join(__dirname, '../uploads/' + req.params.id));
  },

  postCreateFolderRoot: asyncHandler(async (req, res, next) => {
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
    res.redirect('/');
  }),

  getInFolder: asyncHandler(async (req, res, next) => {
    const folder = await prisma.folder.findUnique({
      where: { id: +req.params.id },
      include: { childrenFolders: true },
    });
    console.log(folder);
    res.locals.folderid = +req.params.id;
    res.render('index', {
      title: folder.name,
      folders: folder.childrenFolders,
    });
  }),
};
