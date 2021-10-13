import express from "express";
import { downloadLink } from "./api/download";

const app = express();
const PORT = 8000;

app.use("/static", express.static("static"));

app.use(express.json());

app.get("/", (req, res) =>
  res.send("This is Raphaël's technical challenge API!")
);
app.post("/download-link", downloadLink);

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
