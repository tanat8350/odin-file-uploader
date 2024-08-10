/*
  Warnings:

  - Added the required column `fileLocation` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userid` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "fileLocation" TEXT NOT NULL,
ADD COLUMN     "userid" INTEGER NOT NULL;
