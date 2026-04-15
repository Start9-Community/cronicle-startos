import { FileHelper, smtpShape, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  adminPassword: z.string().optional().catch(undefined),
  smtp: smtpShape,
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)
