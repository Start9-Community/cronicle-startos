# Updating the upstream version

This package builds Cronicle **from source** from the official
[jhuckaby/Cronicle](https://github.com/jhuckaby/Cronicle) release tarball (see
`Dockerfile`). "Upstream" is the Cronicle software itself.

## Determining the upstream version

- **Cronicle** ([jhuckaby/Cronicle](https://github.com/jhuckaby/Cronicle)) — fetch the latest release tag:

  ```sh
  gh release view -R jhuckaby/Cronicle --json tagName -q .tagName
  ```

  The current pin lives in `startos/manifest/index.ts` at
  `images.cronicle.source.dockerBuild.buildArgs.CRONICLE_VERSION` (the `Dockerfile`
  downloads `Cronicle/archive/refs/tags/v${CRONICLE_VERSION}.tar.gz`, so drop the
  leading `v`).

## Applying the bump

1. Bump `CRONICLE_VERSION` in `startos/manifest/index.ts` (and the `ARG`
   default in `Dockerfile`) to the new version, dropping the leading `v`.
2. **Re-verify the two vendored Docker patches still apply** to the new source:
   - `assets/patch-engine.js` anchors on the string `// determine master server
eligibility` in `lib/engine.js` and injects a single-node `goMaster()`. The
     build **fails loudly** if that anchor moves — update the anchor if so.
   - `assets/docker-entrypoint.js` runs `bin/control.sh setup` and seeds
     `global/servers/0` on first boot. Confirm Cronicle still exposes
     `bin/control.sh setup` and the `pixl-server-storage/standalone` API.

3. **Re-verify the `_combo.js` runtime patch** in `startos/main.ts`. It matches
   the markers `var url = app.proto + job.hostname` and `var remote_api_url =
app.proto + job.hostname` in `htdocs/js/pages/JobDetails.class.js` (bundled
   into `htdocs/js/_combo.js` by `bin/build.js dist`). It throws on a missing
   marker — update the regexes in `main.ts` if the upstream UI changed.
4. **Check the CHANGELOG for breaking changes / new config gates**, and note
   behavior changes in the release notes.
