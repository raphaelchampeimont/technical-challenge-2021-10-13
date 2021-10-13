import { Document } from "../common/db";
import axios from "axios";

const CHECK_FOR_NEW_TASKS_EVERY = 5000;

async function downloadDocument(document: Document) {
  let url = document.originalUrl;

  try {
    const response = await axios.get(url);
  } catch (error) {
    document.update({
      downloadSuccessful: false,
    });
    console.log(
      document.originalUrl + " failed to download. Marking this URL as failed."
    );
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