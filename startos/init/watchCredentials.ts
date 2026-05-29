import { setAdminPassword } from '../actions/setAdminPassword'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const watchCredentials = sdk.setupOnInit(async (effects) => {
  const adminPasswordSet = await storeJson
    .read((s) => s.adminPasswordSet)
    .const(effects)

  if (!adminPasswordSet) {
    await sdk.action.createOwnTask(effects, setAdminPassword, 'critical', {
      reason: i18n('Set the admin password before signing in to Cronicle'),
    })
  }
})
