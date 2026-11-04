FROM node:24-bookworm-slim

# Match the host user so files written into the bind mount stay owned by you.
ARG UID=1000
ARG GID=1000

# Reuse the group if the GID already exists in the image (e.g. macOS GID 20 is dialout here).
RUN getent group "${GID}" >/dev/null || groupadd -g "${GID}" hostgroup \
    && usermod -u "${UID}" -g "${GID}" node

ENV NEXT_TELEMETRY_DISABLED=1

# The bind mount supplies the working tree, dependencies included. Creating it
# here keeps the image usable without the mount.
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

USER node

WORKDIR /home/node/app

CMD ["tail", "-f", "/dev/null"]
