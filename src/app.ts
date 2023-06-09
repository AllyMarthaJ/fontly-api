import express from "express";
import dotenv from "dotenv";

// Routes.
import canvas from "./canvas";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json({ limit: 1024 ** 3 }));

app.use("/canvas", canvas);

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});

process.on("SIGHUP", (signal) => {
	console.log(`Received event: ${signal}`);
});
