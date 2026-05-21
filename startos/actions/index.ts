import { sdk } from '../sdk'
import { deployPlugin } from './deployPlugin'
import { manageSmtp } from './manageSmtp'
import { removePlugin } from './removePlugin'
import { setAdminPassword } from './setAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(setAdminPassword)
  .addAction(manageSmtp)
  .addAction(deployPlugin)
  .addAction(removePlugin)
