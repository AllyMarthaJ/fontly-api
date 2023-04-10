# fontly-api
Canvas-centric API for text-image-ascii art conversions

## Demo
https://fontly.sevr.org is where I run a stable-ish instance of fontly-api.

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

## Docker image
Offering builds is hard. Here are some instructions to build fontly-api yourself.

1. In your working directory, run `git clone https://github.com/AllyMarthaJ/fontly-api`.

### via docker-compose
This is your daily reminder to **never** run docker as root.

2. In the services section of your `docker-compose` file, add something like the following:
```yml
  fontly:
    build:
      context: fontly-api
      dockerfile: Dockerfile
    container_name: fontly
    ports:
      - 8000:8000
    user: "1000:1000"
    environment:
      - PORT=8000
    restart: unless-stopped
```

3. Run `docker-compose up -d --build fontly` (or something along those lines) - you can force recreate the container using `docker-compose up -d --force-recreate --build fontly`.

I recommend using something like nginx or haproxy to reverse proxy your fontly instance. 

## via docker
2. Build the image using `docker build -t fontly .` from inside the `fontly-api` directory.
3. Run `docker run -p 8000:8000 --env PORT=8000 --name fontly-api -d fontly` to build a container with the name `fontly-api` bound to the port `8000`, which is externally visible.

## Endpoints
- `/canvas/` is where all the canvascentric operations occur. 
  - `/image/` is where all image related operations occur.
    - `/pml/` is the quickstart Multipart Form POST endpoint for converting an image to lightness-based ASCII art
    - `/render/` is where all image rendering occurs.
      - `/pixelMap/` is a Multipart Form POST request to convert an image to an RGB matrix
  - `/text/` is where all text related operations occur.
    - `/pml/` is the quickstart JSON POST endpoint for converting some text to lightness-based ASCII art
    - `/pma/` is the quickstart JSON POST endpoint for converting some text to average-pixel-channel-based ASCII art
    - `/render/` is where all text rendering occurs.
      - `/pixelMap/` is a JSON POST request to convert text to an RGB matrix
  - `/transform/` is where all transformations occur
    - `/average/` is a JSON POST request to transform an RGB matrix to average-pixel-channel-based ASCII art
    - `/lightness/` is a JSON POST request to transform an RGB matrix to lightness-based ASCII art 
    - `/mapLightness/` is a JSON POST request to map a symbol & RGB matrix to a lightness value
    
For each actionable endpoint, a GET request will return the appropriate body and URL parameters required to make the request successfully.
