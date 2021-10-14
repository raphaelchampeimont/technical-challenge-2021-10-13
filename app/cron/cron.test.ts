import { Request, Response, NextFunction } from "express";
import { handlePendingTasks } from "./cron";
import { initDB, Document } from "../common/db";
import { initStorage } from "../common/localstorage";

beforeAll(async () => {
  // Reset the content of the DB and local storage
  await initDB();
  await initStorage();
});

afterEach(() => {
  jest.clearAllMocks();
});

test("handlePendingTasks() should generate thumbnail", async () => {
  // Insert a pending file in the DB (the file will really be downloaded and processed)
  await Document.create({
    originalUrl: "https://www.almacha.org/almacha/phd-RC.pdf",
  });
  await handlePendingTasks();
  const document = await Document.findOne({
    where: {
      originalUrl: "https://www.almacha.org/almacha/phd-RC.pdf",
    },
  });
  expect(document?.thumbnailSuccessful).toBe(true);
});

test("handlePendingTasks() should mark thumbnail as failed if it fails", async () => {
  await Document.create({
    originalUrl: "https://www.almacha.org/doesnotexist.pdf",
  });
  await handlePendingTasks();
  const document = await Document.findOne({
    where: {
      originalUrl: "https://www.almacha.org/doesnotexist.pdf",
    },
  });
  expect(document?.thumbnailSuccessful).toBe(false);
});
