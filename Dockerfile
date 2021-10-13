FROM node:14

# Create a regular user to avoid running the app as root
RUN useradd appuser -s /bin/bash -m
RUN ["mkdir", "/var/app"]
RUN ["chown", "appuser:appuser", "/var/app"]
USER appuser

COPY app/package.json /var/app/package.json
COPY app/package-lock.json /var/app/package-lock.json
WORKDIR /var/app
RUN ["npm", "install"]

# Run the app
CMD ["npm", "start"]
