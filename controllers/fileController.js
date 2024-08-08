const path = require('path');

const upload = require('../config/upload');
const prisma = require('../config/prisma');

module.exports = {
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

  getDownload: (req, res) => {
    res.download(path.join(__dirname, '../uploads/' + req.params.id));
  },
};
