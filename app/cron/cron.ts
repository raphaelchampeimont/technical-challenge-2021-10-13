import { Document } from "../common/db";
import { LOCAL_STORAGE_DIR, THUMBNAILS_DIR } from "../common/localstorage";
import { createWriteStream, WriteStream } from "fs";
import { rm, copyFile } from "fs/promises";
import { promisify } from "util";
import { exec } from "child_process";
import axios from "axios";
import { AxiosResponse } from "axios";

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

async function downloadPDF(url: string, destinationPath: string) {
  const writer = createWriteStream(destinationPath);

  const response: AxiosResponse<any> = await axios.get(url, {
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

const execPromise = promisify(exec);

async function downloadAndProcessDocument(document: Document) {
  let url = document.originalUrl;
  const ORIGINAL_TEMP_FILE = LOCAL_STORAGE_DIR + "/temp_download.pdf";
  const THUMBNAIL_TEMP_FILE = LOCAL_STORAGE_DIR + "/temp_thumbnail.png";

  console.log("Downloading and processing " + url);

  // Cleanup any previous temp file if any is present
  await rm(ORIGINAL_TEMP_FILE, { force: true });
  await rm(THUMBNAIL_TEMP_FILE, { force: true });

  await downloadPDF(url, ORIGINAL_TEMP_FILE);

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

export async function handlePendingTasks() {
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
        console.error(error);
        await markDocumentAsFailed(document);
        continue; // go to next document to process
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
