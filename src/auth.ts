import { readFileSync } from "fs";
import { Express } from "express";
import * as jwt from "express-jwt";

export default function (app: Express): Express {
  const certLocation = process.env.AUTH_CERT || "cert.pem";
  const pubKey = readFileSync(certLocation);

  app.use(
    jwt({
      secret: pubKey,
      algorithms: ["RS256"],
    })
  );
  return app;
}
