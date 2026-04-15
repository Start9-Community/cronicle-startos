import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'

export const getAdminCredentials = sdk.Action.withoutInput(
  'get-admin-credentials',

  async ({ effects }) => ({
    name: i18n('Get Admin Credentials'),
    description: i18n('Retrieve your Cronicle admin username and password'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),

  async ({ effects }) => {
    const store = await storeJson.read().once()
    return {
      version: '1' as const,
      title: 'Admin Credentials',
      message: 'Save this password — you can change it later in the Cronicle admin UI under Admin > Users.',
      result: {
        type: 'group' as const,
        value: [
          {
            type: 'single' as const,
            name: 'Username',
            description: null,
            value: 'admin',
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single' as const,
            name: 'Password',
            description: null,
            value: store?.adminPassword ?? 'UNKNOWN',
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
