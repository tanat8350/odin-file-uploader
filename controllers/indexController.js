const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

module.exports = {
  index: asyncHandler(async (req, res) => {
    const title = 'Odin File uploader';

    if (!res.locals.currentUser) {
      res.render('index', { title });
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
    res.render('index', { title, folders, files });
  }),
};
