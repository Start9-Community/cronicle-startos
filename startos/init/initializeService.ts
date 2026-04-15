import { utils } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { getAdminCredentials } from '../actions/getAdminCredentials'
import { i18n } from '../i18n'

export const initializeService = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  const adminPassword = utils.getDefaultString({
    charset: 'a-z,A-Z,0-9',
    len: 22,
  })

  await storeJson.write(effects, {
    adminPassword,
    smtp: { selection: 'disabled', value: {} },
  })

  await sdk.action.createOwnTask(effects, getAdminCredentials, 'critical', {
    reason: i18n('Retrieve your admin credentials'),
  })
})
