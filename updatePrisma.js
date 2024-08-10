const prisma = require('./config/prisma');

async function main() {
  await prisma.file.updateMany({
    where: { fileLocation: null },
    data: { fileLocation: '/uploads' },
  });
  await prisma.user.updateMany({
    where: { userid: null },
    data: { userid: 1 },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
