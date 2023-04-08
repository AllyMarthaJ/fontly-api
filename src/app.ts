import express from "express";
import dotenv from "dotenv";
import { renderFromData, renderToCanvas } from "./canvas";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.post("/canvas/render/raw", (req, res) => {
	const rendered = renderFromData(req.body.data, {
		background: req.body.background,
		foreground: req.body.foreground,
		threshold: req.body.threshold,
	});
	res.send(rendered);
});

app.post("/canvas/render/:text", (req, res) => {
	const img = renderToCanvas({
		text: req.params.text,
		fontFamily: req.body.fontFamily,
		fontSize: req.body.fontSize,
		fill: req.body.fill,
	});

	const rendered = renderFromData(img, {
		background: req.body.background,
		foreground: req.body.foreground,
		threshold: req.body.threshold,
	});

	res.send(rendered);
});

app.post("/canvas/data/:text", (req, res) => {
	res.setHeader("content-type", "application/json");

	const img = renderToCanvas({
		text: req.params.text,
		fontFamily: req.body.fontFamily,
		fontSize: req.body.fontSize,
		fill: req.body.fill,
	});
	res.send(JSON.stringify(img));
});

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});
