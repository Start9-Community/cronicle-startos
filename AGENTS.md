# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Hash passwords with Cronicle's own `bcrypt-node`, inside the container.** `pixl-server-user` stores `bcrypt.hashSync(plaintext + user.salt)` — the per-user salt is part of the input, so a hash produced any other way is rejected at login rather than failing loudly.
- **The admin record's path is MD5-sharded and hardcoded.** `pixl-server-storage`'s filesystem engine maps the key `users/admin` to `data/users/34/68/bc/3468bc0c4e5f6aa06c7aee62212ac18f.json`. Both the fresh-install path (patch `conf/setup.json` before setup runs) and the existing-install path (patch the live record) are needed — neither covers the other.
- **`clear-pending-admin-password` is gated on the apply oneshot** so a failed apply retries on the next start instead of dropping the password silently.
- **Plugin dependencies install at start-up, not at deploy time.** The `install-plugin-deps` oneshot is what makes a deployed plugin survive an image update; it skips any plugin that already has its modules.
- **`conf/config.json` is seeded from the image's sample only when absent, then patched in place for SMTP alone.** Don't regenerate it — everything else in that file is the user's.
