<p align="center">
  <img src="icon.png" alt="Cronicle Logo" width="21%">
</p>

# Cronicle on StartOS

> Everything not listed in this document should behave the same as upstream
> Cronicle. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Cronicle](https://github.com/jhuckaby/Cronicle) is a multi-server task scheduler with a web interface — cron with a UI, live logs, and plugins. This package runs it as a single master, sets its admin password from StartOS, wires its email through the server's SMTP, and patches its front end so live logs work behind a reverse proxy.

- **Upstream repo:** <https://github.com/jhuckaby/Cronicle>
- **Wrapper repo:** <https://github.com/Start9-Community/cronicle-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, built here from a pinned upstream version.

| Property      | Value                                      |
| ------------- | ------------------------------------------ |
| Image         | Built from this repo's `Dockerfile`        |
| Architectures | x86_64, aarch64                            |
| Entrypoint    | The image's own, via `sdk.useEntrypoint()` |

| Subcontainer   | Purpose                                               |
| -------------- | ----------------------------------------------------- |
| `cronicle-sub` | Every oneshot and the daemon — the one to `attach` to |

**The package patches Cronicle's front-end bundle at every start**, before the daemon runs. Cronicle builds its live-log WebSocket and API URLs from the container's own internal hostname, which is unreachable through a reverse proxy — so live logs simply never load. The patch rewrites those two URL constructions to use the browser's own origin when the job ran on this server, leaving external workers untouched.

It is done by string replacement against markers in the bundle, and **it fails loudly**: if a marker is missing the service refuses to start rather than serving a subtly broken UI. That is deliberate — a silent failure here looks like "live logs are broken" with nothing to point at. An upstream version bump is the thing that breaks it.

The pre-compressed copy of the bundle is deleted in the same step, so the web server cannot serve the stale original.

The daemon runs in foreground mode; everything else about the image is upstream's.

## Volume and Data Layout

One volume, mounted four times — one subpath per Cronicle directory.

| Volume             | Mount Point             | Purpose                         |
| ------------------ | ----------------------- | ------------------------------- |
| `main` / `data`    | `/opt/cronicle/data`    | Jobs, schedules, users, history |
| `main` / `conf`    | `/opt/cronicle/conf`    | Cronicle's configuration        |
| `main` / `logs`    | `/opt/cronicle/logs`    | Its logs                        |
| `main` / `plugins` | `/opt/cronicle/plugins` | Deployed plugins                |

Splitting one volume across four mounts keeps each of Cronicle's directories where the application expects it while leaving the rest of its installation in the image — so an image update replaces the code and keeps the state.

The package's own `store.json` sits at the volume root, outside all four.

## File Models

One model, and two of its three fields exist to solve the same problem in different directions.

| File         | Format | Modelled                | Written by                |
| ------------ | ------ | ----------------------- | ------------------------- |
| `store.json` | JSON   | Yes — `FileHelper.json` | Init, actions, and `main` |

- **`adminPasswordSet`** — a persistent guard: has a password ever been set? It drives the onboarding task and is **never cleared**.
- **`pendingAdminPassword`** — a one-time trigger: a password waiting to be applied. Set by the action, consumed by start-up, then cleared.
- **`smtp`** — the email configuration selection.

**The two password fields are separate on purpose, and the reason is a real bug that was fixed.** The pending password is read **non-reactively**, so clearing it after it is applied does not restart the service. Reading it reactively is what used to re-apply the stored password on every restart — silently reverting any password the user had changed inside Cronicle itself.

That is also why the guard is a separate field: clearing the trigger must not drop the record that a password was ever set, or the onboarding task would come back.

The SMTP selection **is** read reactively, so changing it restarts the service and re-applies it.

**Cronicle's own `config.json` is not modelled.** It is seeded from the image's sample on first start, and thereafter patched in place by a start-up script for the SMTP fields only. Everything else in it is the user's, and survives.

## Dependencies

None.

## Network Access and Interfaces

One interface.

| Interface | Id   | Type | Port | Description                   |
| --------- | ---- | ---- | ---- | ----------------------------- |
| Web UI    | `ui` | ui   | 3012 | The web interface of Cronicle |

Bound on the `ui-multi` MultiHost over HTTP and not masked.

**Cronicle is designed as a multi-server system, and this package is the master only.** External worker servers connect _to_ it, and the front-end patch above deliberately preserves direct connections for jobs that ran on a worker — only jobs on this server are routed through the proxy.

## Installation and First-Run Flow

Start-up is a chain of four steps before the daemon, and the order is load-bearing:

1. **Seed the configuration** — copy the image's sample config in, but only if none exists.
2. **Install plugin dependencies** — for each deployed plugin that has a manifest and no installed modules, install them. This is what makes a plugin survive an image update.
3. **Apply SMTP** — patch the email fields into Cronicle's config.
4. **Apply the admin password**, if one is pending.

Then the daemon starts, and a fifth step clears the pending password — gated on the apply having succeeded, so a failed apply retries on the next start rather than being silently dropped.

**The password is applied two ways because there are two cases.** On a fresh install it patches Cronicle's setup file before first-run setup consumes it; on an existing install it patches the live admin record directly. The hash is produced by **Cronicle's own bcrypt module**, inside the container, so it is a hash Cronicle will accept rather than one that merely looks right.

Install raises a critical task to set that password; nothing is reachable until it is done.

## Actions

Four actions.

### Set Admin Password

Generates a new admin password and applies it. Run it when its task appears, or to recover from a lost password.

- **What it changes:** the pending password in the store, which start-up applies to Cronicle's user record.
- **Cost:** the service restarts — the password is applied by a start-up step, not live.
- **Repeat safety:** each run generates a **new** password and invalidates the previous one.
- **Outputs:** the username and password, shown once.
- **It overrides a password changed inside Cronicle.** If a user changed their password in the app and then runs this, the app's password is replaced.

### Configure SMTP

Points Cronicle's email at the server's system SMTP or at a custom server. Run it to enable job notifications.

- **What it changes:** the SMTP selection in the store, and through it Cronicle's config on the next start.
- **Cost:** the service restarts.
- **Repeat safety:** idempotent.
- **Using the system SMTP** takes the server's configured credentials, optionally with a different from-address.
- **With nothing configured**, Cronicle's email fields are blanked rather than left stale, so notifications fail visibly instead of going somewhere unexpected.

### Deploy Node.js Plugin

Adds a plugin by submitting its script, and optionally a manifest declaring its dependencies.

- **What it changes:** writes the plugin into the plugins directory on the volume.
- **Cost:** dependencies are installed on the **next start**, by the start-up step — not when the action runs.
- **Repeat safety:** re-deploying the same plugin id replaces it.
- **What happens next:** the plugin still has to be registered inside Cronicle's own UI before a job can use it. Deploying puts the code in place; it does not create the plugin entry.

### Remove Plugin

Deletes a deployed plugin.

- **What it changes:** removes the plugin's directory from the volume.
- **Repeat safety:** idempotent.
- **It does not clean up inside Cronicle.** Jobs still referencing the plugin will fail rather than disappear — remove them in the UI too.

## Tasks

One, and it is reactive.

| Task               | Severity   | Raised when                   | Cleared when            |
| ------------------ | ---------- | ----------------------------- | ----------------------- |
| Set Admin Password | `critical` | No password has ever been set | Set Admin Password runs |

It is keyed on the persistent guard, not on the pending trigger — so it appears once, on a fresh install, and does **not** come back every time a password is applied and cleared.

`critical` blocks the service from starting and suspends the ordinary controls.

## Health Checks

One check, on the only daemon.

| Check     | Displayed as    | Method                 |
| --------- | --------------- | ---------------------- |
| `primary` | "Web Interface" | Port 3012 is listening |

It reports that the interface is serving. Whether scheduled jobs are succeeding is Cronicle's own business, visible in its UI and its email notifications — nothing here surfaces a failing job.

A service that will not start at all, with no failing check, is most likely the front-end patch refusing to apply after an image change; the service logs name the missing marker.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. That is all four subpaths plus the store: every job, schedule, user, log, and plugin, along with the admin-password guard and the SMTP selection.

A restored instance comes back complete and raises no task. Plugin dependencies are re-installed on the first start if the modules did not travel, which is the same step that runs after an image update.

The one thing to know is that logs and job history are in the backup too, so its size tracks how much history Cronicle has accumulated rather than how much is configured.

## Limitations and Differences

1. **The front-end bundle is patched at every start**, and the service refuses to start if the patch no longer applies. An upstream version bump is the thing that triggers this.
2. **This is a single master.** Nothing here configures worker servers, though the patch deliberately leaves their direct connections intact.
3. **The admin password is applied at start-up, not live**, so setting it restarts the service — and overrides a password changed inside Cronicle.
4. **Plugin dependencies install on the next start**, not when a plugin is deployed.
5. **Deploying a plugin does not register it** in Cronicle; that is still done in the UI.
6. **Only the SMTP fields of Cronicle's config are managed.** Everything else in it is yours, and is not reset.

---

## Quick Reference for AI Consumers

```yaml
package_id: cronicle
image: built from ./Dockerfile # upstream version pinned as a build arg
architectures:
  - x86_64
  - aarch64
subcontainers:
  - cronicle-sub # every oneshot and the daemon
volumes:
  main:
    data: /opt/cronicle/data
    conf: /opt/cronicle/conf
    logs: /opt/cronicle/logs
    plugins: /opt/cronicle/plugins
file_models:
  - store.json # conf/config.json is seeded and patched, not modelled
startos_managed_env_vars:
  - CRONICLE_foreground
dependencies: []
interfaces:
  ui: { type: ui, port: 3012 }
actions:
  - set-admin-password
  - manage-smtp
  - deploy-plugin
  - remove-plugin
tasks:
  - { action: set-admin-password, severity: critical }
health_checks:
  - primary # displayed "Web Interface"
```
