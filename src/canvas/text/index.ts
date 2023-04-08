import { Router } from "express";

import renderers from "./renderers";
import transformers from "./transformers";
import quickStart from "./quick-start";

const router = Router();

router.use("/render", renderers);
router.use("/transform", transformers);
router.use("/", quickStart);

// router.post("/render/raw", (req, res) => {
// 	const rendered = renderFromData(req.body.data, {
// 		background: req.body.background,
// 		foreground: req.body.foreground,
// 		threshold: req.body.threshold,
// 	});

// 	res.send(rendered);
// });

// router.post("/render/:text", (req, res) => {
// 	const img = renderToCanvas({
// 		text: req.params.text,
// 		fontFamily: req.body.fontFamily,
// 		fontSize: req.body.fontSize,
// 		fill: req.body.fill,
// 	});

// 	const rendered = renderFromData(img, {
// 		background: req.body.background,
// 		foreground: req.body.foreground,
// 		threshold: req.body.threshold,
// 	});

// 	res.send(rendered);
// });

// router.post("/data/:text", (req, res) => {
// 	res.setHeader("content-type", "application/json");

// 	const img = renderToCanvas({
// 		text: req.params.text,
// 		fontFamily: req.body.fontFamily,
// 		fontSize: req.body.fontSize,
// 		fill: req.body.fill,
// 	});
// 	res.send(JSON.stringify(img));
// });

export default router;
