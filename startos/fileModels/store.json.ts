import { FileHelper, smtpShape, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  // Persistent guard: has an admin password ever been set? Drives the onboarding
  // task in watchCredentials. Set once by the Set Admin Password action; never cleared.
  adminPasswordSet: z.boolean().catch(false),
  // One-time trigger: a password waiting to be applied to Cronicle at next startup.
  // Set by the action (which then restarts), then consumed and cleared by main. Kept
  // separate from adminPasswordSet so clearing it after apply doesn't drop the guard,
  // and read non-reactively (.once) in main so clearing it never restarts the service.
  pendingAdminPassword: z.string().nullable().catch(null),
  smtp: smtpShape.optional().catch(undefined),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)
