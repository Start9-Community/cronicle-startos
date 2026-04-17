import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  password: Value.text({
    name: i18n('New Password'),
    description: i18n('The new password for the Cronicle admin account'),
    required: true,
    default: null,
    masked: true,
    generate: { charset: 'a-z,A-Z,0-9', len: 22 },
    inputmode: 'text',
    patterns: [],
    placeholder: null,
  }),
})

export const resetAdminPassword = sdk.Action.withInput(
  'reset-admin-password',

  async ({ effects }) => ({
    name: i18n('Reset Admin Password'),
    description: i18n('Change the password for the Cronicle admin account'),
    warning: i18n('The service will restart automatically to apply the new password.'),
    allowedStatuses: 'any' as const,
    group: null,
    visibility: 'enabled' as const,
  }),

  inputSpec,

  async ({ effects }) => {
    return { password: undefined }
  },

  async ({ effects, input }) => {
    await storeJson.merge(effects, { adminPassword: input.password })

    return {
      version: '1' as const,
      title: i18n('Password Saved'),
      message: i18n('Admin password updated. The service is restarting to apply the change.'),
      result: null,
    }
  },
)
