import { mkdir, rmdir } from "fs/promises";

const LOCAL_STORAGE_DIR = "./localstorage";

export async function initStorage() {
  // Remove all local stored files, to be consistent with the fact that we clear the DB on each start (see db.ts)
  await mkdir(LOCAL_STORAGE_DIR, {
    recursive: true,
  });
  await rmdir(LOCAL_STORAGE_DIR + "/thumbnails", {
    recursive: true,
  });
  await mkdir(LOCAL_STORAGE_DIR + "/thumbnails");
  console.log("Local storage ready");
}
