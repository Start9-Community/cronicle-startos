import { sdk } from '../sdk'
import { deployPlugin } from './deployPlugin'
import { getAdminCredentials } from './getAdminCredentials'
import { manageSmtp } from './manageSmtp'
import { removePlugin } from './removePlugin'
import { resetAdminPassword } from './resetAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(getAdminCredentials)
  .addAction(resetAdminPassword)
  .addAction(manageSmtp)
  .addAction(deployPlugin)
  .addAction(removePlugin)
