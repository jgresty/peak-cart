import * as express from "express";
import { body, param, validationResult } from "express-validator";
import services from "./services";

const app = express();
app.use(express.json());

app.post(
  "/",
  [body("items").isArray(), body("items.*").isUUID()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return services.addItem(req.body).then(res.status(201).send.bind(res));
  }
);

app.delete("/:id", [param("id").isUUID()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return services
    .deleteItem(req.params.id)
    .then(res.status(204).send.bind(res));
});

app.put("/", [body("items").isArray({ max: 0 })], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return services.clearItems().then(res.status(204).send.bind(res));
});

app.get("/", (req, res) =>
  services.getAllItems().then(res.status(200).send.bind(res))
);

export default app;
