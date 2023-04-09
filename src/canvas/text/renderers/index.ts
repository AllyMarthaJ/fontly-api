import { Router } from "express";
import { DrawOptions, convertToPixelMap } from "./pixelMap";
import { typeMap } from "../../../helpers/type-map";

const router = Router();

router.get("/pixelMap", (_, res) => {
	const exampleBody: DrawOptions = {
		text: ".",
		fontFamily: "Arial",
		fontSize: 20,
		fill: true,
		forceWidth: 15,
		forceHeight: 10,
	};
	const mappedType = typeMap({
		params: { text: "." },
		body: exampleBody,
	});

	const content = JSON.stringify(mappedType);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});

router.post("/pixelMap/:text?", (req, res) => {
	const pixelMap = convertToPixelMap({
		...req.body,
		text: req.params.text || req.body.text,
	});

	const content = JSON.stringify(pixelMap);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});

export default router;
