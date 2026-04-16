// Here we define any constants or functions that are shared by multiple components
// throughout the package codebase. This file will be unnecessary for many packages.

import { readdir, stat } from 'node:fs/promises'
import { sdk } from './sdk'

export const uiPort = 3012

export type PluginEntry = {
  /** Filesystem key: the .js filename stem or directory name */
  id: string
  /** Human-readable label for UI */
  displayName: string
  /** Absolute in-container path Cronicle uses as the "Script" value */
  scriptPath: string
}

/**
 * Lists all custom plugin scripts that have been deployed to the plugins volume.
 * Returns single-file plugins (*.js) and directory-based plugins (dir/index.js).
 * Built-in Cronicle plugins are stored in the data volume, not here, so everything
 * found is a user-deployed plugin.
 */
export async function listCustomPlugins(): Promise<PluginEntry[]> {
  const pluginsDir = sdk.volumes.main.subpath('plugins')

  let entries: string[]
  try {
    entries = await readdir(pluginsDir)
  } catch {
    return []
  }

  const plugins: PluginEntry[] = []

  for (const entry of entries) {
    const fullPath = `${pluginsDir}/${entry}`
    let s: Awaited<ReturnType<typeof stat>>
    try {
      s = await stat(fullPath)
    } catch {
      continue
    }

    if (s.isFile() && entry.endsWith('.js')) {
      const id = entry.slice(0, -3) // strip .js
      plugins.push({
        id,
        displayName: id,
        scriptPath: `/opt/cronicle/plugins/${entry}`,
      })
    } else if (s.isDirectory()) {
      plugins.push({
        id: entry,
        displayName: entry,
        scriptPath: `/opt/cronicle/plugins/${entry}/index.js`,
      })
    }
  }

  return plugins
}
