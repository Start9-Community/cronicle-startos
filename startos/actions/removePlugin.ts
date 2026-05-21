import { rm } from 'node:fs/promises'

import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { listCustomPlugins } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  plugin: Value.dynamicSelect(async () => {
    const plugins = await listCustomPlugins()

    // Always provide at least one entry so the select renders.
    // If no plugins exist, _none is shown and the handler rejects it gracefully.
    const values: Record<string, string> =
      plugins.length > 0
        ? Object.fromEntries(
            plugins.map((p) => [p.id, `${p.displayName}  (${p.scriptPath})`]),
          )
        : { _none: i18n('No plugins deployed yet') }

    return {
      name: i18n('Plugin to Remove'),
      description: i18n(
        'Select the custom plugin script to permanently delete from the filesystem.',
      ),
      default: Object.keys(values)[0],
      values,
    }
  }),
})

export const removePlugin = sdk.Action.withInput(
  'remove-plugin',

  async ({ effects }) => ({
    name: i18n('Remove Plugin'),
    description: i18n(
      'Permanently delete a deployed plugin script from disk. Remove it from Cronicle Admin → Plugins first to avoid broken job references.',
    ),
    warning: i18n(
      'This permanently deletes the plugin script from disk. Jobs configured to use it will fail until the plugin is redeployed or reassigned.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async () => null,

  async ({ input }) => {
    const { plugin } = input

    if (plugin === '_none') {
      throw new Error('No custom plugins have been deployed yet.')
    }

    const plugins = await listCustomPlugins()
    if (!plugins.find((p) => p.id === plugin)) {
      throw new Error(
        `Plugin "${plugin}" was not found. It may have already been removed.`,
      )
    }

    // Remove either the single .js file or the whole directory (npm-dep plugins).
    await rm(sdk.volumes.main.subpath(`plugins/${plugin}.js`), { force: true })
    await rm(sdk.volumes.main.subpath(`plugins/${plugin}`), {
      recursive: true,
      force: true,
    })

    return {
      version: '1' as const,
      title: i18n('Plugin Removed'),
      message: `Plugin "${plugin}" has been deleted from disk. If a Cronicle plugin entry still points to this script, remove it from Admin → Plugins to avoid errors.`,
      result: null,
    }
  },
)
