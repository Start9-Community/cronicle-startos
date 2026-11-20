# Cronicle, built from source from the official jhuckaby/Cronicle release tarball.
#
# This replaces the third-party `soulteary/cronicle` image, which stalled at
# 0.9.80 (mid-2025). Building from the upstream tarball ourselves lets the
# package track Cronicle directly — a bump moves CRONICLE_VERSION and the
# tarball's CRONICLE_SHA256 together. The Docker glue (single-node
# master-election patch + first-boot entrypoint) is adapted from
# soulteary/docker-cronicle (MIT); everything else is stock Cronicle installed
# to its default /opt/cronicle layout.

ARG CRONICLE_VERSION=0.9.135
ARG CRONICLE_SHA256=96dcfebd7682df31134cfea2fa5e0f5d372fcddbfb82488e9ce0a12122367cd1

FROM node:22-bullseye AS builder
ARG CRONICLE_VERSION
ARG CRONICLE_SHA256
WORKDIR /opt/cronicle
RUN curl -fsSL -o /tmp/cronicle.tar.gz \
      "https://github.com/jhuckaby/Cronicle/archive/refs/tags/v${CRONICLE_VERSION}.tar.gz" \
 && echo "${CRONICLE_SHA256}  /tmp/cronicle.tar.gz" | sha256sum -c - \
 && tar zxf /tmp/cronicle.tar.gz -C /tmp \
 && mv "/tmp/Cronicle-${CRONICLE_VERSION}"/* . \
 && rm -rf /tmp/* \
 && npm install --unsafe-perm \
 && npm install --save-exact shell-quote@1.11.0
# StartOS runs exactly one Cronicle node (never a worker): force it to elect
# itself master so it schedules jobs. Anchored on a stable source string so it
# survives version drift (fails the build loudly if Cronicle's internals move).
COPY assets/patch-engine.js /tmp/patch-engine.js
RUN node /tmp/patch-engine.js
# First-boot storage init + single-node server self-registration.
COPY assets/docker-entrypoint.js ./bin/docker-entrypoint.js
# Build the browser bundle (htdocs/js/_combo.js) and initialize storage.
COPY assets/patch-build.js /tmp/patch-build.js
RUN node /tmp/patch-build.js \
 && node bin/build.js dist \
 && test -s htdocs/js/_combo.js \
 && test -s htdocs/css/_combo.css \
 && bin/control.sh setup

# Pinned to a patched Node.js release by tag and digest; move both together.
FROM node:22.23.5-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a
RUN apk add --no-cache bash curl procps
COPY --from=builder /opt/cronicle /opt/cronicle
WORKDIR /opt/cronicle
ENV CRONICLE_foreground=1 \
    CRONICLE_echo=1 \
    CRONICLE_color=1 \
    HOSTNAME=main
CMD ["node", "bin/docker-entrypoint.js"]
