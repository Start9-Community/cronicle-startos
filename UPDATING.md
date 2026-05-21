# Updating the upstream version

This package runs the third-party [`soulteary/cronicle`](https://hub.docker.com/r/soulteary/cronicle) Docker image, which packages [jhuckaby/Cronicle](https://github.com/jhuckaby/Cronicle). "Upstream" here means the Cronicle software; the image tag tracks Cronicle's own version string.

## Determining the upstream version

- **Cronicle** ([jhuckaby/Cronicle](https://github.com/jhuckaby/Cronicle)) — fetch the latest release tag:

  ```sh
  gh release view -R jhuckaby/Cronicle --json tagName -q .tagName
  ```

- Confirm the matching image tag exists on Docker Hub before bumping:

  ```sh
  curl -s 'https://hub.docker.com/v2/repositories/soulteary/cronicle/tags?page_size=100' \
    | jq -r '.results[].name'
  ```

  The current pin lives in `startos/manifest/index.ts` at `images.cronicle.source.dockerTag` (the version after the `:` in `soulteary/cronicle:<version>`).

## Applying the bump

1. Bump `dockerTag` in `startos/manifest/index.ts` to `soulteary/cronicle:<new version>` (drop the leading `v` from the release tag).
2. The browser-side `_combo.js` live-log patch in `startos/main.ts` matches against upstream markers and throws if they are missing. After a bump, build and run the service once to confirm the patch still applies; if it throws, update the markers/regexes in `main.ts` to match the new image.
