FROM node:14

# Create a regular user to avoid running the app as root
RUN useradd appuser -s /bin/bash -m
RUN ["mkdir", "/var/app"]
RUN ["chown", "appuser:appuser", "/var/app"]

# Copy only package list here so that node_modules cache can be kept
# even if the code is modified as long as the package list remains the same.
COPY app/package.json /var/app/package.json
COPY app/package-lock.json /var/app/package-lock.json
RUN ["chown", "-R", "appuser:appuser", "/var/app"]
WORKDIR /var/app
USER appuser
RUN ["npm", "install"]

COPY app /var/app

# Run the app
CMD ["npm", "start"]
