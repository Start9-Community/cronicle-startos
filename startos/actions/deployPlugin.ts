import { chmod, mkdir } from 'node:fs/promises'

import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

// Minimal working plugin template shown as the default in the form.
const DEFAULT_SCRIPT = `#!/usr/bin/env node

// Cronicle Node.js Plugin
// Docs: https://github.com/jhuckaby/Cronicle/blob/master/docs/Plugins.md

const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
  let job;
  try { job = JSON.parse(line); } catch (e) { process.exit(1); }

  const { params } = job;

  // ── Your plugin logic here ─────────────────────────────────────────────
  // Access custom job parameters via params.my_param_id

  // Optional: report progress (0.0 – 1.0)
  // process.stdout.write(JSON.stringify({ progress: 0.5 }) + '\\n');

  // Optional: append text to the live log
  process.stdout.write(JSON.stringify({ log: 'Plugin ran successfully' }) + '\\n');

  // Required: signal completion
  process.stdout.write(JSON.stringify({ complete: 1, description: 'Done' }) + '\\n');
  process.exit(0);
});
`

const inputSpec = InputSpec.of({
  name: Value.text({
    name: 'Plugin ID',
    description:
      'Unique identifier for this plugin. Used as the filename on disk. Lowercase letters, numbers, and hyphens only.',
    required: true,
    default: null,
    placeholder: 'my-plugin',
    patterns: [
      {
        regex: '^[a-z0-9][a-z0-9-]*$',
        description: 'Lowercase letters, numbers, and hyphens. Must start with a letter or number.',
      },
    ],
    maxLength: 64,
  }),
  script: Value.textarea({
    name: 'Plugin Script',
    description:
      'Node.js script implementing the Cronicle plugin protocol. Receives job JSON on stdin, writes progress and completion JSON to stdout.',
    required: true,
    default: DEFAULT_SCRIPT,
    minRows: 15,
    maxRows: 40,
  }),
  packageJson: Value.textarea({
    name: 'package.json (optional)',
    description:
      'Provide a package.json to add npm dependencies. The plugin will be stored as a directory and dependencies will be installed automatically on the next service restart.',
    required: false,
    default: null,
    minRows: 5,
    maxRows: 20,
    placeholder:
      '{\n  "name": "my-plugin",\n  "dependencies": {\n    "axios": "^1.7.0"\n  }\n}',
  }),
})

export const deployPlugin = sdk.Action.withInput(
  'deploy-plugin',

  {
    name: 'Deploy Node.js Plugin',
    description:
      'Write a custom Node.js plugin script to the plugins directory. After deploying, register it in Cronicle under Admin → Plugins.',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  inputSpec,

  async () => ({ name: undefined, script: DEFAULT_SCRIPT, packageJson: null }),

  async ({ input }) => {
    const { name, script, packageJson } = input

    // Ensure a shebang is present so the OS can execute the script directly.
    const scriptContent = script.startsWith('#!') ? script : `#!/usr/bin/env node\n${script}`

    await mkdir(sdk.volumes.main.subpath('plugins'), { recursive: true })

    let scriptPath: string

    if (packageJson) {
      // Directory-based plugin — supports npm dependencies.
      const pluginDir = sdk.volumes.main.subpath(`plugins/${name}`)
      await mkdir(pluginDir, { recursive: true })
      await sdk.volumes.main.writeFile(`plugins/${name}/index.js`, scriptContent)
      await chmod(`${pluginDir}/index.js`, 0o755)
      await sdk.volumes.main.writeFile(`plugins/${name}/package.json`, packageJson)
      scriptPath = `/opt/cronicle/plugins/${name}/index.js`
    } else {
      // Single-file plugin.
      await sdk.volumes.main.writeFile(`plugins/${name}.js`, scriptContent)
      await chmod(sdk.volumes.main.subpath(`plugins/${name}.js`), 0o755)
      scriptPath = `/opt/cronicle/plugins/${name}.js`
    }

    return {
      version: '1' as const,
      title: 'Plugin Deployed',
      message:
        `Plugin "${name}" has been written to disk` +
        (packageJson ? '. Restart Cronicle to install npm dependencies.' : '.') +
        '\n\nTo activate it:\n1. Open Cronicle → Admin → Plugins\n2. Click "Add Plugin"\n3. Set the Script path to the value below\n4. Add any custom parameters and save',
      result: {
        type: 'single' as const,
        name: 'Script Path',
        description: 'Enter this as the Script value when registering the plugin in Cronicle',
        value: scriptPath,
        masked: false,
        copyable: true,
        qr: false,
      },
    }
  },
)
