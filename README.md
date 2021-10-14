# technical-challenge-2021-10-13

This project features an API to 1) ask the server to download PDF links and generate thumbnails (POST /download-link) and 2) get the generated thumbnails URLs (GET /list-thumbnails).

Downloading the PDFs and generating the thumbnails occur in the background asynchronously. The status of each link (not yet processed, successful or failed) is kept in a table in PostgreSQL database. The database schema is managed with the Sequelize ORM.

## How to run it

All you need is to have Docker installed. Then run:

    docker-compose build && docker-compose up

## How to test it manually

Example of file upload (self-hosted on the app for testing):

    curl -XPOST http://localhost:8000/download-link -H 'Content-Type: application/json' -d '{"url":"http://localhost:8000/static/test.pdf"}'

Your thumbnails will be generated in the background and should be available a few seconds later in the list available at http://localhost:8000/list-thumbnails

With a multi-page PDF (self-hosted on the app for testing):

    curl -XPOST http://localhost:8000/download-link -H 'Content-Type: application/json' -d '{"url":"http://localhost:8000/static/test_multipage.pdf"}'

With a PDF from an online source and in HTTPS:

    curl -XPOST http://localhost:8000/download-link -H 'Content-Type: application/json' -d '{"url":"https://www.almacha.org/almacha/phd-RC.pdf"}'

## How to run the test suite

To run the test suite, stop any running docker-compose and instead run it with:

    docker-compose -f docker-compose-test.yml build && docker-compose -f docker-compose-test.yml up

This will start Postgres but not the app, which is replaced by the test suite run.
