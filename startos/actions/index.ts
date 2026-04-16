import { sdk } from '../sdk'
import { deployPlugin } from './deployPlugin'
import { getAdminCredentials } from './getAdminCredentials'
import { manageSmtp } from './manageSmtp'
import { removePlugin } from './removePlugin'

export const actions = sdk.Actions.of()
  .addAction(getAdminCredentials)
  .addAction(manageSmtp)
  .addAction(deployPlugin)
  .addAction(removePlugin)
