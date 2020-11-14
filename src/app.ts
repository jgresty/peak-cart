import * as express from "express";
import services from "./services";

const app = express();
app.use(express.json());

app.post("/", (req, res) =>
  services.addItem(req.body).then(res.status(201).send.bind(res))
);

export default app;