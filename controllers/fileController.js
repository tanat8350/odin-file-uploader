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
    async (req, res) => {
      await prisma.file.create({
        data: {
          id: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
        },
      });
      res.redirect('/');
    },
  ],

  postDownload: (req, res) => {
    res.download(path.join(__dirname, '../uploads/' + req.params.id));
  },
};
