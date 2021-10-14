import { Request, Response, NextFunction } from "express";
import { listThumbnails } from "./list_thumbnails";

const mockRequest = {} as Request;

const mockResponse = {
  json: () => {},
} as Response;

mockResponse.json = jest.fn();

test("listThumbnails works", async () => {
  await listThumbnails(mockRequest, mockResponse);
  expect(mockResponse.json).toHaveBeenCalledTimes(1);
  expect(mockResponse.json).toHaveBeenCalledWith([]);
});
