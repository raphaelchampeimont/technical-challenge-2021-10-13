import { Request, Response, NextFunction } from "express";
import { listThumbnails } from "./list_thumbnails";
import { initDB, Document } from "../common/db";
import { initStorage } from "../common/localstorage";

const mockRequest = {} as Request;

const mockResponse = {
  json: () => {},
} as Response;

mockResponse.json = jest.fn();

beforeAll(async () => {
  // Reset the content of the DB and local storage
  await initDB();
  await initStorage();
});

afterEach(() => {
  jest.clearAllMocks();
});

test("listThumbnails should return an empty array when no files have been processed", async () => {
  await listThumbnails(mockRequest, mockResponse);
  expect(mockResponse.json).toHaveBeenCalledTimes(1);
  expect(mockResponse.json).toHaveBeenCalledWith([]);
});

test("listThumbnails should return only successful thumbnails", async () => {
  await Document.create({
    originalUrl: "http://example.com/failed",
    thumbnailSuccessful: false,
  });
  await Document.create({
    originalUrl: "http://example.com/not-processed-yet",
    thumbnailSuccessful: null,
  });
  await Document.create({
    originalUrl: "http://example.com/success",
    thumbnailSuccessful: true,
  });
  await listThumbnails(mockRequest, mockResponse);
  expect(mockResponse.json).toHaveBeenCalledTimes(1);
  expect(mockResponse.json).toHaveBeenCalledWith([
    {
      originalUrl: "http://example.com/success",
      thumbnailUrl: "http://localhost:8000/thumbnails/3.png",
    },
  ]);
});
