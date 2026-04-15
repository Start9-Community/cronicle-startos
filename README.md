<p align="center">
  <img src="icon.png" alt="Cronicle Logo" width="21%">
</p>

# Cronicle on StartOS

> **Upstream repo:** <https://github.com/jhuckaby/Cronicle>  
> **Docker image:** `soulteary/cronicle:0.9.80`

Cronicle is a multi-server task scheduler and runner with a web UI. It replaces cron with a visual interface for managing scheduled jobs, viewing live logs, and tracking job history.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                      |
| ------------- | -------------------------- |
| Image         | `soulteary/cronicle:0.9.80` |
| Architectures | x86_64, aarch64            |
| Entrypoint    | upstream default           |

---

## Volume and Data Layout

All persistent data lives under a single `main` volume, split into four subpath mounts:

| Subpath         | Mount Point              | Purpose                          |
| --------------- | ------------------------ | -------------------------------- |
| `main/data`     | `/opt/cronicle/data`     | Job history, user records, state |
| `main/conf`     | `/opt/cronicle/conf`     | `config.json` and setup files    |
| `main/logs`     | `/opt/cronicle/logs`     | Server logs                      |
| `main/plugins`  | `/opt/cronicle/plugins`  | Custom plugins                   |

---

## Installation and First-Run Flow

1. **`seed-conf`** (oneshot) — copies `sample_conf/` into `main/conf` if `config.json` does not yet exist.
2. **`set-admin-password`** (oneshot) — patches the admin password hash into `conf/setup.json` (fresh install) and any existing `data/.../admin.json` (upgrade).
3. **`primary`** (daemon) — starts Cronicle in foreground mode via the upstream entrypoint.

On a fresh install Cronicle's own setup routine (`control.sh setup`) runs automatically on first start and seeds the database from `conf/setup.json`.

The admin username is `admin`. The password is generated at install time and can be retrieved via the StartOS "Get Admin Credentials" action.

---

## Configuration Management

Cronicle's configuration is stored in `main/conf/config.json`. The file is seeded from `sample_conf/config.json` on first run and persists across restarts.

Notable defaults set in `sample_conf/config.json`:

| Setting                  | Value   | Reason                                              |
| ------------------------ | ------- | --------------------------------------------------- |
| `web_direct_connect`     | `false` | API calls use `location.host` (the proxy), not the internal IP |
| `web_socket_use_hostnames` | `false` | Prefer IPs over hostnames for internal routing    |

---

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose          |
| --------- | ---- | -------- | ---------------- |
| Web UI    | 3012 | HTTP     | Cronicle web UI  |

---

## Actions (StartOS UI)

| Action                  | Description                                      |
| ----------------------- | ------------------------------------------------ |
| Get Admin Credentials   | Shows the `admin` username and password          |

---

## Backups and Restore

**Included in backup:** the full `main` volume (`data`, `conf`, `logs`, `plugins`).

**Restore behavior:** the volume is restored before the service starts. The `set-admin-password` oneshot re-applies the stored password on every start, so credentials retrieved via "Get Admin Credentials" remain valid after a restore.

---

## Health Checks

| Check         | Method                   | Messages                                                                      |
| ------------- | ------------------------ | ----------------------------------------------------------------------------- |
| Web Interface | Port listening (3012)    | Success: "The web interface is ready" / Error: "The web interface is not ready" |

---

## Dependencies

None.

---

## Limitations and Differences

1. **Live log WebSocket** — Cronicle normally connects the browser directly to the internal container IP for live job output. At startup, `_combo.js` is patched so that when a job runs on the master (the only server in a typical StartOS install), the WebSocket and log-download URLs are rewritten to use `location.origin`, routing through the StartOS proxy. Jobs running on external workers keep the original direct-connect behavior.

2. **Single-master only (typical)** — Cronicle supports multi-server clustering. External workers reachable by public hostname/IP work normally. Workers only reachable by a private/container IP will not be accessible from the browser.

3. **No HTTPS on the container** — Cronicle's internal server runs HTTP on port 3012. TLS termination is handled by the StartOS proxy.

---

## What Is Unchanged from Upstream

The Cronicle application, its configuration format, plugin system, job scheduler, and all API endpoints are unmodified. The only changes are:

- `_combo.js` patched at service start to fix live-log URLs behind a reverse proxy
- `conf/setup.json` and `data/.../admin.json` patched at service start to apply the stored admin password

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: cronicle
image: soulteary/cronicle:0.9.80
architectures: [x86_64, aarch64]
volumes:
  main/data:    /opt/cronicle/data
  main/conf:    /opt/cronicle/conf
  main/logs:    /opt/cronicle/logs
  main/plugins: /opt/cronicle/plugins
ports:
  ui: 3012
dependencies: none
default_credentials: admin / retrieved via "Get Admin Credentials" action
actions:
  - change-admin-password
runtime_patches:
  - file: /opt/cronicle/htdocs/js/_combo.js
    reason: rewrite live-log WebSocket/API URLs to route through StartOS proxy
```
