Use the `/assets` directory to include additional files or scripts needed by your service.

For this package, the Docker build's helper scripts live here and are `COPY`d in by the
root `Dockerfile`:

- `docker-entrypoint.js` — first-boot storage init + single-node server self-registration
  (the image's `CMD`).
- `patch-engine.js` — build-time patch that forces single-node master election in
  Cronicle's `lib/engine.js`.

Keep new build/entrypoint scripts here — the packaging guide's documented home for them —
not at the repo root or in ad-hoc directories.
