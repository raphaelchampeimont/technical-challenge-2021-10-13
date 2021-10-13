import { Request, Response, NextFunction } from "express";
import { Document } from "../common/db";

export async function downloadLink(req: Request, res: Response) {
  await Document.create({
    originalUrl: req.body.url,
  });

  await res.json({});
}
