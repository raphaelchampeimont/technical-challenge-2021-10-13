import { Document } from "../common/db";
import axios from "axios";

const CHECK_FOR_NEW_TASKS_EVERY = 5000;

async function markDownloadAsFaied(document: Document) {
  await document.update({
    downloadSuccessful: false,
  });
}

async function downloadDocument(document: Document) {
  let url = document.originalUrl;

  let response;
  try {
    response = await axios.get(url);
  } catch (error) {
    await markDownloadAsFaied(document);
    console.log(
      document.originalUrl + " failed to download. Marking this URL as failed."
    );
    return;
  }

  const contentType = response.headers["content-type"];
  if (contentType != "application/pdf") {
    await markDownloadAsFaied(document);
    console.log(
      document.originalUrl + " has incorrect content type: " + contentType
    );
    return;
  }
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
