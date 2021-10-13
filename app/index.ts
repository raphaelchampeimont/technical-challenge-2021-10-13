import express from "express";
import { downloadLink } from "./api/download";
import { initDB } from "./common/db";

const app = express();
const PORT = 8000;

app.use("/static", express.static("static"));

app.use(express.json());

app.get("/", (req, res) =>
  res.send("This is Raphaël's technical challenge API!")
);
app.post("/download-link", downloadLink);

(async () => {
  // Connect to the DB and create the necessary tables
  await initDB();
  // Now the DB is ready, listen to requests
  app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
  });
})();
