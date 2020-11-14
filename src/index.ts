import createApp from "./app";
import auth from "./auth";

const port = process.env.PORT || 3000;
const app = createApp(auth);
app.set("port", port);

app.listen(port, () => console.log(`Server listening on port ${port}`));
