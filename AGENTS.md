# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `cronicle`.** Single UI service (a `ui` interface on port 3012); no dependents and no dependencies.
- **Built from source** from `jhuckaby/Cronicle` via the root `Dockerfile` (`dockerBuild`, `CRONICLE_VERSION` build arg) — it no longer uses the abandoned third-party `soulteary/cronicle` image. The vendored Docker helper scripts live in **`assets/`** (the packaging guide's home for build/entrypoint scripts) and are `COPY`d by the `Dockerfile`: `assets/docker-entrypoint.js` (first-boot storage init + single-node server self-registration, the image `CMD`) and `assets/patch-engine.js` (build-time patch forcing single-node `goMaster` in `lib/engine.js`). **Keep new build/entrypoint scripts in `assets/`, not at the repo root or in ad-hoc dirs.**
- **`main.ts` runtime-patches the built `_combo.js`** (and deletes `_combo.js.gz`) so the browser builds live-log WebSocket / API URLs from `location.origin` instead of Cronicle's internal container hostname, which is unreachable through the StartOS reverse proxy. The patch asserts on marker strings and throws if they moved — expect to update the regexes in `main.ts` when bumping the upstream version.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep app logs), use `start-cli package attach cronicle -n cronicle -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — here `cronicle-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".
