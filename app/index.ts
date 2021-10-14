import express from "express";
import { downloadLink } from "./api/download_link";
import { initDB } from "./common/db";
import morgan from "morgan";
import { runPeriodically } from "./cron/cron";
import { initStorage, LOCAL_STORAGE_DIR } from "./common/localstorage";
import { listThumbnails } from "./api/list_thumbnails";

const app = express();
const PORT = 8000;

app.use(morgan("dev"));
app.use("/static", express.static("static"));
app.use("/thumbnails", express.static(LOCAL_STORAGE_DIR + "/thumbnails"));
app.use(express.json());

app.get("/", (req, res) =>
  res.send("This is Raphaël's technical challenge API!")
);

app.post("/download-link", async (req, res, next) => {
  try {
    await downloadLink(req, res);
  } catch (error) {
    next(error);
  }
});

app.get("/list-thumbnails", async (req, res, next) => {
  try {
    await listThumbnails(req, res);
  } catch (error) {
    next(error);
  }
});

async function main() {
  // Connect to the DB and create the necessary tables
  await initDB();
  // Init local storage
  await initStorage();

  // Now the DB is ready, listen to requests
  app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
    // Start the "cron" process
    setTimeout(runPeriodically, 0);
  });
}

main().catch((error) => {
  console.error("FATAL ERROR:");
  console.error(error);
});
