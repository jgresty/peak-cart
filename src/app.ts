import * as express from "express";
import { body, param, validationResult } from "express-validator";
import services from "./services";

type Middleware = (app: express.Express) => express.Express;

export default function (...middleware: Middleware[]): express.Express {
  const app = middleware.reduce((app, func) => func(app), express());
  app.use(express.json());

  app.post("/rpc/delivery", (req, res) =>
    res
      .status(200)
      .send(services.delivery(req.body.id, req.body.weight, req.body.days))
  );

  app.post(
    "/",
    [body("items").isArray(), body("items.*").isUUID()],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      return services
        .addItem(req.user.sub, req.body)
        .then(res.status(201).send.bind(res));
    }
  );

  app.delete("/:id", [param("id").isUUID()], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return services
      .deleteItem(req.user.sub, req.params.id)
      .then(res.status(204).send.bind(res));
  });

  app.put("/", [body("items").isArray({ max: 0 })], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return services
      .clearItems(req.user.sub)
      .then(res.status(204).send.bind(res));
  });

  app.get("/", (req, res) => {
    return services
      .getAllItems(req.user.sub)
      .then(res.status(200).send.bind(res));
  });

  return app;
}
