import { readFile } from 'node:fs/promises'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const showSecretKey = sdk.Action.withoutInput(
  'show-secret-key',

  async () => ({
    name: i18n('Show Secret Key'),
    description: i18n(
      "Show Cronicle's secret key, which each external worker server must use to join this server.",
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async () => {
    const config = await readFile(
      sdk.volumes.main.subpath('conf/config.json'),
      'utf8',
    ).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return null
      throw error
    })
    if (config === null)
      throw new Error(
        i18n(
          'Cronicle has not generated its secret key yet. Start the service once, then run this action again.',
        ),
      )

    return {
      version: '1',
      title: i18n('Cronicle Secret Key'),
      message: i18n(
        'Set this as secret_key in conf/config.json on each external worker server, then restart it.',
      ),
      result: {
        type: 'single',
        value: JSON.parse(config).secret_key,
        masked: true,
        copyable: true,
        qr: false,
        launchable: false,
      },
    }
  },
)
