const path = require('path');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const upload = require('../config/upload');
const prisma = require('../config/prisma');

const validateFile = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name is required')
    .optional({ values: 'falsy' }),
  // later add file format
  body('move')
    .trim()
    .isNumeric()
    .withMessage('Move needs to be number')
    .optional({ values: 'falsy' }),
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
        redirect = `/folder/${req.params.id}`;
      }
      const created = await prisma.file.create({
        data: file,
      });
      if (!created) {
        return next({ status: 404, message: 'Fail to create file' });
      }
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
      redirect = `/folder/${deleted.folderid}`;
    }
    res.redirect(redirect);
  }),

  postUpdateFile: [
    validateFile,
    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);
      // later add display error msg
      if (!errors.isEmpty()) {
        return next({ status: 400, message: 'invalid input' });
      }
      const file = {};
      req.body.name ? (file.name = req.body.name) : null;
      if (req.body.move) {
        req.body.move == '0'
          ? (file.folderid = null)
          : (file.folderid = +req.body.move);
      }
      const updated = await prisma.file.update({
        where: { id: req.params.id },
        data: file,
      });
      if (!updated) {
        return next({ status: 404, message: 'Fail to update file' });
      }
      res.redirect(`/file/${req.params.id}`);
    }),
  ],
};
