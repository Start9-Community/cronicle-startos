<p align="center">
  <img src="icon.png" alt="Cronicle Logo" width="21%">
</p>

# Cronicle on StartOS

> **Upstream repo:** <https://github.com/jhuckaby/Cronicle>  
> **Built from source** — see [`Dockerfile`](Dockerfile)

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
| Image         | Built from source (see [`Dockerfile`](Dockerfile)) |
| Architectures | x86_64, aarch64            |
| Entrypoint    | `assets/docker-entrypoint.js` (first-boot storage setup + single-node master election) |

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
2. **`install-plugin-deps`** (oneshot) — for any plugin directory under `main/plugins/` that contains a `package.json` but no `node_modules`, runs `npm install --production` inside the container. No-op on fresh installs.
3. **`apply-smtp`** (oneshot) — writes the resolved SMTP credentials into `conf/config.json`.
4. **`set-admin-password`** (oneshot) — when a password is *pending* (just queued by the Set Admin Password action), patches the hash into `conf/setup.json` (fresh install) and any existing `data/.../admin.json`. A no-op otherwise.
5. **`clear-pending-admin-password`** (oneshot) — once the password has been applied, clears the pending trigger so it is applied exactly once and not re-applied on later restarts.
6. **`primary`** (daemon) — starts Cronicle in foreground mode via the upstream entrypoint.

On a fresh install Cronicle's own setup routine (`control.sh setup`) runs automatically on first start and seeds the database from `conf/setup.json`.

The admin username is `admin`. No password is generated at install. Instead, a `watchCredentials` init step surfaces a **critical task** (gated on the persistent `adminPasswordSet` flag) prompting the user to run the **Set Admin Password** action before signing in. That action generates a random password, queues it as a one-time `pendingAdminPassword` trigger, restarts the service to apply it once, and returns it to the user; `main` then clears the trigger. After it has been applied, Cronicle owns the credential in its own data volume, so a password later changed inside Cronicle (Admin → Users) is no longer overwritten on restart. Re-running the action rotates the password.

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
| Set Admin Password      | Generate a random admin password (first-set via the install task, and rotation later); stores it, returns it, and restarts to apply |
| Configure SMTP          | Set up email sending (disabled / StartOS system SMTP / custom) |
| Deploy Node.js Plugin   | Write a Node.js plugin script to `main/plugins/`. Optionally provide a `package.json`; dependencies are installed automatically via the `install-plugin-deps` oneshot on next restart. Returns the script path to register in Cronicle Admin → Plugins. |
| Remove Plugin           | Delete a previously deployed plugin script or directory from `main/plugins/`. Always visible; shows a dynamic list of deployed plugins. |

### Plugin Notes

- **No npm by default** — the `install-plugin-deps` oneshot runs `npm install` inside the container, which requires outbound clearnet access. Without a configured outbound gateway (e.g. StartTunnel), npm cannot reach `registry.npmjs.org` and the install will fail. Node.js built-in modules (`https`, `http`, `fs`, `child_process`, `crypto`, etc.) work without any npm install.
- **Registration is manual** — deploying a plugin writes the script to disk. You still need to register it in Cronicle under Admin → Plugins and configure its parameter fields there.
- **Single-file vs directory plugins** — if no `package.json` is provided the script is saved as `plugins/<name>.js`; if `package.json` is provided it is saved as `plugins/<name>/index.js` alongside the `package.json`.

---

## Backups and Restore

**Included in backup:** the full `main` volume (`data`, `conf`, `logs`, `plugins`).

**Restore behavior:** the volume is restored before the service starts. Both Cronicle's own `admin.json` (in `data`) and the password stored in `main/store.json` come back with the volume, and `main` re-applies the stored password on start — so logins remain valid after a restore.

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

3. **Email requires SMTP configuration** — Cronicle defaults to `localhost:25` which has no mail daemon. Use the "Configure SMTP" action to point it at the StartOS system SMTP (if configured in StartOS settings) or a custom provider. Without this, job notification emails are silently dropped.

4. **No HTTPS on the container** — Cronicle's internal server runs HTTP on port 3012. TLS termination is handled by the StartOS proxy.

---

## What Is Unchanged from Upstream

The Cronicle application, its configuration format, plugin system, job scheduler, and all API endpoints are unmodified. The only changes are:

- `_combo.js` patched at service start to fix live-log URLs behind a reverse proxy
- `conf/setup.json` / `data/.../admin.json` patched once when a password is pending (just queued by the Set Admin Password action), then the trigger is cleared; a no-op on later restarts
- `conf/config.json` patched at service start to apply SMTP credentials

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: cronicle
image: built from source (Dockerfile, official jhuckaby/Cronicle release)
architectures: [x86_64, aarch64]
volumes:
  main/data:    /opt/cronicle/data
  main/conf:    /opt/cronicle/conf
  main/logs:    /opt/cronicle/logs
  main/plugins: /opt/cronicle/plugins
ports:
  ui: 3012
dependencies: none
default_credentials: admin / password set via "Set Admin Password" action (prompted by a critical task on install)
actions:
  - set-admin-password      # generate+queue+return admin password (applied once on restart); first-set via install task, also rotation
  - manage-smtp
  - deploy-plugin           # write a Node.js plugin script to main/plugins/
  - remove-plugin           # delete a deployed plugin from main/plugins/
runtime_patches:
  - file: /opt/cronicle/htdocs/js/_combo.js
    reason: rewrite live-log WebSocket/API URLs to route through StartOS proxy
```
