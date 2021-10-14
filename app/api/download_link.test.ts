import { Request, Response, NextFunction } from "express";
import { downloadLink } from "./download_link";
import { initDB, Document } from "../common/db";
import { initStorage } from "../common/localstorage";

const mockRequest = {
  body: {
    url: "http://example.com/document.pdf",
  },
} as Request;

const mockIncorrectFileExtension = {
  body: {
    url: "http://example.com/image.jpg",
  },
} as Request;

const mockIncorrectRequest = {
  body: {
    someRandomField: "hello",
  },
} as Request;

const mockResponse = {} as Response;

mockResponse.json = jest.fn();
mockResponse.status = jest.fn(() => mockResponse);

beforeAll(async () => {
  // Reset the content of the DB and local storage
  await initDB();
  await initStorage();
});

afterEach(() => {
  jest.clearAllMocks();
});

test("downloadLink should reject malformed query", async () => {
  await downloadLink(mockIncorrectRequest, mockResponse);
  expect(mockResponse.json).toHaveBeenCalledTimes(1);
  expect(mockResponse.status).toHaveBeenCalledWith(400);
  expect(mockResponse.json).toHaveBeenCalledWith({
    error: "INVALID_REQUEST_FORMAT",
  });
});

test("downloadLink should reject file with invalid extension", async () => {
  await downloadLink(mockIncorrectFileExtension, mockResponse);
  expect(mockResponse.json).toHaveBeenCalledTimes(1);
  expect(mockResponse.status).toHaveBeenCalledWith(400);
  expect(mockResponse.json).toHaveBeenCalledWith({
    error: "INVALID_URL_EXTENSION",
  });
});

test("downloadLink should store the received link in DB", async () => {
  await downloadLink(mockRequest, mockResponse);
  expect(mockResponse.json).toHaveBeenCalledTimes(1);
  expect(mockResponse.json).toHaveBeenCalledWith({
    status: "URL_SUCCESSFULLY_SUBMITTED",
  });
  // check it is actually stored in the database
  expect(
    (
      await Document.findAndCountAll({
        where: {
          originalUrl: "http://example.com/document.pdf",
        },
      })
    ).count
  ).toBe(1);
});

test("downloadLink should detect when the same URL has already been sent", async () => {
  await downloadLink(mockRequest, mockResponse);
  expect(mockResponse.json).toHaveBeenCalledTimes(1);
  expect(mockResponse.json).toHaveBeenCalledWith({
    status: "URL_ALREADY_SUBMITTED",
  });
});
