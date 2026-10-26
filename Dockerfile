FROM node:24-bookworm-slim

# Match the host user so files written into the bind mount stay owned by you.
ARG UID=1000
ARG GID=1000

# Reuse the group if the GID already exists in the image (e.g. macOS GID 20 is dialout here).
RUN getent group "${GID}" >/dev/null || groupadd -g "${GID}" hostgroup \
    && usermod -u "${UID}" -g "${GID}" node

ENV NEXT_TELEMETRY_DISABLED=1

# Create the app dir and the paths that get anonymous volumes while still root,
# so they are owned by the runtime user and seeded with that ownership.
RUN mkdir -p /home/node/app/node_modules /home/node/app/.next \
    && chown -R node:node /home/node/app

USER node

WORKDIR /home/node/app

CMD ["tail", "-f", "/dev/null"]
