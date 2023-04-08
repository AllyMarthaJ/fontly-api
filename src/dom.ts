import { JSDOM } from "jsdom";

export const doc = new JSDOM().window.document;
