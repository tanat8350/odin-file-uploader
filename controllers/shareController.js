const path = require('path');

const prisma = require('../config/prisma');
const asyncHandler = require('express-async-handler');

const checkExpired = async (id) => {
  const file = await prisma.file.findUnique({
    where: { id: id },
  });
  if (!file || !file.share || file.share < new Date()) {
    return false;
  }
  return file;
};

module.exports = {
  getShared: asyncHandler(async (req, res, next) => {
    const file = await checkExpired(req.params.id);
    if (!file) {
      return next({ status: 404, message: 'Invalid link' });
    }
    res.render('share', { title: file.name, file });
  }),

  postDownloadShared: asyncHandler(async (req, res, next) => {
    const file = await checkExpired(req.params.id);
    if (!file) {
      return next({ status: 404, message: 'Invalid link' });
    }
    res.download(
      path.join(__dirname, '../uploads/' + req.params.id),
      file.name
    );
  }),
};
