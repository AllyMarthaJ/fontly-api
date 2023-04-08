# fontly-api
Canvas-centric API for text-image-ascii art conversions

## Running this server
Run `npm install` in the root directory of fontly-api to fetch dependencies.

Ensure, somewhere, that you have a `PORT` environment variable 
defined (either via `.env` file or otherwise),
with the port you want to use to run the server. 

`npm run-script dev` will allow you to run the server while listening for any
changes you might make.
Otherwise, `npm run-script build` will build to `dist` and `npm run-script run`
will run the server. It will not listen for changes to the TypeScript source,
but changes to the built JS files should be seen.
