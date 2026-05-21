# Cronicle

Cronicle is a self-hosted task scheduler with a web UI — a visual replacement for cron. Schedule and run jobs, watch their output live, and review run history, all from the browser.

## Getting set up

1. Wait for the service to start, then open Cronicle's **Dashboard** tab and click the **Web UI** interface.
2. Set your login password first. On install you'll see a **critical task** prompting you to run the **Set Admin Password** action — run it, and it returns the `admin` username and a generated password. Save it somewhere safe. Log in as **`admin`** with that password.
3. You're in. Create schedules under **Schedule**, and watch jobs run live under **Completed**/**Active** events.

## Actions

- **Set Admin Password** — generates a new random password for the `admin` account, returns it, and restarts the service to apply it. Run it once at install (a critical task prompts you), and any time afterward to rotate the password if it's lost. You can also change the password from inside Cronicle under **Admin → Users**.
- **Configure SMTP** — set up outgoing email so Cronicle can send job notifications. Choose the StartOS system mail server (if you've configured one in StartOS settings) or enter a custom provider. Without this, notification emails are silently dropped — Cronicle's default points at a local mail server that doesn't exist.
- **Deploy Node.js Plugin** — write a custom Node.js plugin script to disk. After deploying, register it inside Cronicle under **Admin → Plugins** using the script path the action returns. If your plugin needs npm packages, supply a `package.json`; dependencies install on the next restart (this requires outbound internet access — e.g. via StartTunnel).
- **Remove Plugin** — delete a previously deployed plugin script from disk. Remove its entry in **Admin → Plugins** first to avoid broken job references.

## Things to know

- **Live job logs** are routed through the StartOS proxy, so watching a running job's output in the browser works out of the box for jobs running on this server.
- **Multi-server clustering** works for external workers reachable by public hostname or IP. Workers reachable only on a private/container network won't be accessible from your browser.
- **Backups** capture all Cronicle data — jobs, history, configuration, and deployed plugins. Your admin password is re-applied automatically after a restore.

## Documentation

- [Cronicle Web UI docs](https://github.com/jhuckaby/Cronicle/blob/master/docs/WebUI.md)
- [Cronicle plugin docs](https://github.com/jhuckaby/Cronicle/blob/master/docs/Plugins.md)
