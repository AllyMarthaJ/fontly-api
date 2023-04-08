import { JSDOM } from "jsdom";

export const dom = new JSDOM().window.document;
