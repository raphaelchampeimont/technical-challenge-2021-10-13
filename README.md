# technical-challenge-2021-10-13

## How to run it

All you need is to have Docker installed. Then run:

    docker-compose build && docker-compose up

## How to test it

Example of file upload (self-hosted on the app for testing):

    curl -XPOST http://localhost:8000/download-link -H 'Content-Type: application/json' -d '{"url":"http://localhost:8000/static/test.pdf"}'

Your thumbnails will be generated in the background and should be available a few seconds later in the list available at http://localhost:8000/list-thumbnails

With a multi-page PDF (self-hosted on the app for testing):

    curl -XPOST http://localhost:8000/download-link -H 'Content-Type: application/json' -d '{"url":"http://localhost:8000/static/test_multipage.pdf"}'

With a "real" PDF from an online source:

    curl -XPOST http://localhost:8000/download-link -H 'Content-Type: application/json' -d '{"url":"https://upload.wikimedia.org/wikipedia/commons/b/ba/Global_content_moderation_on_Wikipedia.pdf"}'
