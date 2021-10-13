# technical-challenge-2021-10-13

Example of file upload:

    curl -XPOST http://localhost:8000/download-link -H 'Content-Type: application/json' -d '{"url":"http://localhost:8000/static/test.pdf"}'
