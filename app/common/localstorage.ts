import { mkdir, rmdir } from "fs/promises";

const LOCAL_STORAGE_DIR = "./localstorage";
export const THUMBNAILS_DIR = LOCAL_STORAGE_DIR + "/thumbnails";

export async function initStorage() {
  // Remove all local stored files, to be consistent with the fact that we clear the DB on each start (see db.ts)
  await mkdir(LOCAL_STORAGE_DIR, {
    recursive: true,
  });
  await rmdir(THUMBNAILS_DIR, {
    recursive: true,
  });
  await mkdir(THUMBNAILS_DIR);
  console.log("Local storage ready");
}
