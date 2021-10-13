import { Document } from "../common/db";
import * as superagent from "superagent";
import { LOCAL_STORAGE_DIR } from "../common/localstorage";
import { createWriteStream } from "fs";
import { writeFile } from "fs/promises";

const CHECK_FOR_NEW_TASKS_EVERY = 5000;

async function markDownloadAsFailed(document: Document) {
  await document.update({
    downloadSuccessful: false,
  });
}

async function downloadDocument(document: Document) {
  let url = document.originalUrl;

  let response;
  try {
    response = await superagent.get(url).set("accept", "application/pdf");
  } catch (error) {
    await markDownloadAsFailed(document);
    console.log(
      document.originalUrl + " failed to download. Marking this URL as failed."
    );
    return;
  }

  if (response.type != "application/pdf") {
    await markDownloadAsFailed(document);
    console.log(document.originalUrl + " has incorrect content type");
    return;
  }

  await writeFile(LOCAL_STORAGE_DIR + "/temp.pdf", response.body);
}

async function handlePendingTasks() {
  const documentsToDownload = await Document.findAll({
    where: {
      downloadSuccessful: null,
    },
  });
  if (documentsToDownload.length > 0) {
    console.log(
      documentsToDownload.length + " document(s) need to be downloaded"
    );
    for (let document of documentsToDownload) {
      await downloadDocument(document);
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
