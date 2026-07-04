# Cronicle, built from source from the official jhuckaby/Cronicle release tarball.
#
# This replaces the third-party `soulteary/cronicle` image, which stalled at
# 0.9.80 (mid-2025). Building from the upstream tarball ourselves lets the
# package track Cronicle directly — future bumps are a one-line CRONICLE_VERSION
# change. The Docker glue (single-node master-election patch + first-boot
# entrypoint) is adapted from soulteary/docker-cronicle (MIT); everything else is
# stock Cronicle installed to its default /opt/cronicle layout.

ARG CRONICLE_VERSION=0.9.122

FROM node:20-bullseye AS builder
ARG CRONICLE_VERSION
WORKDIR /opt/cronicle
RUN curl -fsSL -o /tmp/cronicle.tar.gz \
      "https://github.com/jhuckaby/Cronicle/archive/refs/tags/v${CRONICLE_VERSION}.tar.gz" \
 && tar zxf /tmp/cronicle.tar.gz -C /tmp \
 && mv "/tmp/Cronicle-${CRONICLE_VERSION}"/* . \
 && rm -rf /tmp/* \
 && npm install --unsafe-perm
# StartOS runs exactly one Cronicle node (never a worker): force it to elect
# itself master so it schedules jobs. Anchored on a stable source string so it
# survives version drift (fails the build loudly if Cronicle's internals move).
COPY assets/patch-engine.js /tmp/patch-engine.js
RUN node /tmp/patch-engine.js
# First-boot storage init + single-node server self-registration.
COPY assets/docker-entrypoint.js ./bin/docker-entrypoint.js
# Build the browser bundle (htdocs/js/_combo.js) and initialize storage.
RUN node bin/build.js dist && bin/control.sh setup

FROM node:20-alpine
RUN apk add --no-cache bash curl procps
COPY --from=builder /opt/cronicle /opt/cronicle
WORKDIR /opt/cronicle
ENV CRONICLE_foreground=1 \
    CRONICLE_echo=1 \
    CRONICLE_color=1 \
    HOSTNAME=main
CMD ["node", "bin/docker-entrypoint.js"]
