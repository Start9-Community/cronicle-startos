export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Cronicle': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'The web interface of Cronicle': 5,

  // init/watchCredentials.ts
  'Set the admin password before signing in to Cronicle': 6,

  // actions/setAdminPassword.ts
  'Set Admin Password': 7,
  'Generate a new random password for the Cronicle admin account, replacing any existing one. The service restarts to apply it.': 8,
  'Cronicle Login Credentials': 9,
  'Use these credentials to sign in to Cronicle.': 10,
  Username: 11,
  Password: 12,

  // actions/manageSmtp.ts
  'Configure SMTP': 13,
  'Set up email sending for job notifications': 14,

  // actions/deployPlugin.ts
  'Deploy Node.js Plugin': 15,
  'Write a custom Node.js plugin script to the plugins directory. After deploying, register it in Cronicle under Admin → Plugins.': 16,
  'Plugin ID': 17,
  'Unique identifier for this plugin. Used as the filename on disk. Lowercase letters, numbers, and hyphens only.': 18,
  'Plugin Script': 19,
  'Node.js script implementing the Cronicle plugin protocol. Receives job JSON on stdin, writes progress and completion JSON to stdout.': 20,
  'package.json (optional)': 21,
  'Provide a package.json to add npm dependencies. The plugin will be stored as a directory and dependencies will be installed automatically on the next service restart.': 22,
  'Plugin Deployed': 23,
  'Script Path': 24,
  'Enter this as the Script value when registering the plugin in Cronicle': 25,

  // actions/removePlugin.ts
  'Plugin to Remove': 26,
  'Select the custom plugin script to permanently delete from the filesystem.': 27,
  'No plugins deployed yet': 28,
  'Remove Plugin': 29,
  'Permanently delete a deployed plugin script from disk. Remove it from Cronicle Admin → Plugins first to avoid broken job references.': 30,
  'This permanently deletes the plugin script from disk. Jobs configured to use it will fail until the plugin is redeployed or reassigned.': 31,
  'Plugin Removed': 32,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
