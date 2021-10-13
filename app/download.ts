import { Request, Response, NextFunction } from 'express';

export function downloadLink(req: Request, res: Response, next: NextFunction) {
    throw new Error("FakeError")
    res.send("download")
}
