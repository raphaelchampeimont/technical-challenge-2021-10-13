import { Request, Response, NextFunction } from "express";
import { Document } from "../common/db";
import { ValidationError } from "sequelize";

type DownloadLinkOkStatusCode =
  | "URL_ALREADY_SUBMITTED"
  | "URL_SUCCESSFULLY_SUBMITTED";

interface DownloadLinkSuccessfulResponse {
  status: DownloadLinkOkStatusCode;
}

type DownloadLinkErrorCode = "INVALID_REQUEST_FORMAT" | "INVALID_URL_EXTENSION";

interface DownloadLinkFailedResponse {
  error: DownloadLinkErrorCode;
}

type DownloadLinkAPIResponse =
  | DownloadLinkFailedResponse
  | DownloadLinkSuccessfulResponse;

function respondWithClientError(
  res: Response,
  error_code: DownloadLinkErrorCode
) {
  respondWithJson(res.status(400), {
    error: error_code,
  });
}

function respondWithOkStatus(
  res: Response,
  error_code: DownloadLinkOkStatusCode
) {
  respondWithJson(res, {
    status: error_code,
  });
}

function respondWithJson(res: Response, json: DownloadLinkAPIResponse) {
  res.json(json);
}

export async function downloadLink(req: Request, res: Response) {
  if (typeof req.body.url != "string") {
    return respondWithClientError(res, "INVALID_REQUEST_FORMAT");
  }
  if (!req.body.url.toLowerCase().endsWith(".pdf")) {
    return respondWithClientError(res, "INVALID_URL_EXTENSION");
  }
  try {
    await Document.create({
      originalUrl: req.body.url,
    });
  } catch (error) {
    if (
      error instanceof ValidationError &&
      error.name == "SequelizeUniqueConstraintError"
    ) {
      return respondWithOkStatus(res, "URL_ALREADY_SUBMITTED");
    } else {
      // Re-throw if other error
      throw error;
    }
  }

  return respondWithOkStatus(res, "URL_SUCCESSFULLY_SUBMITTED");
}
