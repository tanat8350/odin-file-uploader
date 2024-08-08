const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

module.exports = {
  index: asyncHandler(async (req, res) => {
    const files = await prisma.file.findMany();
    res.render('index', { title: 'Odin File uploader', files });
  }),
};
