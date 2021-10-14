import { Document } from "../common/db";
import { LOCAL_STORAGE_DIR, THUMBNAILS_DIR } from "../common/localstorage";
import { createWriteStream, WriteStream } from "fs";
import { rm, copyFile } from "fs/promises";
import * as http from "http";
import { promisify } from "util";
import { exec } from "child_process";

// FIXME: I know the "request" module is deprecated, but I could'd make axios, superagent or "got" work with TypeScript.
import * as request from "request";

const CHECK_FOR_NEW_TASKS_EVERY = 1000;

async function markDocumentAsFailed(document: Document) {
  await document.update({
    thumbnailSuccessful: false,
  });
}

async function markDocumentAsSuccessful(document: Document) {
  await document.update({
    thumbnailSuccessful: true,
  });
}

async function downloadPDF(
  url: string,
  destpath: string,
  callback: (error?: Error) => void
) {
  request
    .get(url)
    .on("response", (response) => {
      callback();
    })
    .on("error", (error) => {
      callback(error);
    })
    .pipe(createWriteStream(destpath));
}

const downloadPDFPromise = promisify(downloadPDF);
const execPromise = promisify(exec);

async function downloadAndProcessDocument(document: Document) {
  let url = document.originalUrl;
  const ORIGINAL_TEMP_FILE = LOCAL_STORAGE_DIR + "/temp_download.pdf";
  const THUMBNAIL_TEMP_FILE = LOCAL_STORAGE_DIR + "/temp_thumbnail.png";

  console.log("Downloading and processing " + url);

  // Cleanup any previous temp file if any is present
  await rm(ORIGINAL_TEMP_FILE, { force: true });
  await rm(THUMBNAIL_TEMP_FILE, { force: true });

  await downloadPDFPromise(url, ORIGINAL_TEMP_FILE);

  await execPromise(
    "convert -thumbnail 400x400 " +
      ORIGINAL_TEMP_FILE +
      "[0] " +
      THUMBNAIL_TEMP_FILE
  );

  await copyFile(
    THUMBNAIL_TEMP_FILE,
    THUMBNAILS_DIR + "/" + document.id + ".png"
  );

  await rm(ORIGINAL_TEMP_FILE, { force: true });
  await rm(THUMBNAIL_TEMP_FILE, { force: true });

  console.log("Thumbnail for " + url + " successfully created");
}

async function handlePendingTasks() {
  const documentsToDownload = await Document.findAll({
    where: {
      thumbnailSuccessful: null,
    },
  });
  if (documentsToDownload.length > 0) {
    console.log(
      documentsToDownload.length + " document(s) need to be downloaded"
    );
    for (let document of documentsToDownload) {
      try {
        await downloadAndProcessDocument(document);
      } catch (error) {
        markDocumentAsFailed(document);
        throw error;
      }
      await markDocumentAsSuccessful(document);
    }
  }
}

export async function runPeriodically() {
  try {
    await handlePendingTasks();
  } catch (error) {
    console.error(error);
  }
  // Schedule the next run
  setTimeout(runPeriodically, CHECK_FOR_NEW_TASKS_EVERY);
}
