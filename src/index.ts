import app from "./app";

const port = process.env.PORT || 3000;
app.set("port", port);

app.listen(port, () => console.log(`Server listening on port ${port}`));
