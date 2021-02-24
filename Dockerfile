# Update the VARIANT arg in docker-compose.yml to pick a Node version: 10, 12, 14
ARG VARIANT=14
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}
# Update args in docker-compose.yaml to set the UID/GID of the "node" user.
RUN npm install
RUN npm start