# This Dockerfile is used for the production environment
ARG VARIANT=14
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}
ENV NODE_ENV=production
# Update args in docker-compose.yaml to set the UID/GID of the "node" user.
RUN npm install
RUN npm start