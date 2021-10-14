import { Request, Response, NextFunction } from "express";
import { Document } from "../common/db";
import { ValidationError } from "sequelize";

export async function downloadLink(req: Request, res: Response) {
  if (typeof req.body.url != "string") {
    return res.status(400).json({
      error: "INVALID_REQUEST_FORMAT",
    });
  }
  if (!req.body.url.toLowerCase().endsWith(".pdf")) {
    return res.status(400).json({
      error: "INVALID_URL_EXTENSION",
    });
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
      return res.json({
        status: "URL_ALREADY_SUBMITTED",
      });
    } else {
      // Re-throw if other error
      throw error;
    }
  }

  res.json({
    status: "URL_SUCCESSFULLY_SUBMITTED",
  });
}
