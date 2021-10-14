import { Request, Response, NextFunction } from "express";
import { Document } from "../common/db";
import { ValidationError } from "sequelize";

export async function listThumbnails(req: Request, res: Response) {
  const documents = await Document.findAll({
    where: {
      thumbnailSuccessful: true,
    },
  });
  res.json(
    documents.map((document) => ({
      originalUrl: document.originalUrl,
      thumbnailUrl: "http://localhost:8000/thumbnails/" + document.id + ".png",
    }))
  );
}
