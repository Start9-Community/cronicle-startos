import { FileHelper, IMPOSSIBLE, VersionInfo, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

export const current = VersionInfo.of({
  version: '0.9.80:4',
  releaseNotes: {
    en_US: 'Internal updates (start-sdk 2.0.x)',
    es_ES: 'Actualizaciones internas (start-sdk 2.0.x)',
    de_DE: 'Interne Aktualisierungen (start-sdk 2.0.x)',
    pl_PL: 'Aktualizacje wewnętrzne (start-sdk 2.0.x)',
    fr_FR: 'Mises à jour internes (start-sdk 2.0.x)',
  },
  migrations: {
    // Pre-0.9.80:3 the admin password lived in store.json `adminPassword`, which main
    // read reactively and re-applied on every restart (and which nothing ever cleared).
    // 0.9.80:3 splits it into a persistent `adminPasswordSet` guard (drives the
    // onboarding task) and a transient `pendingAdminPassword` trigger (applied once,
    // then cleared). Read the legacy field and mark the guard so existing installs
    // aren't re-nagged; the password already lives in Cronicle's own data, so nothing
    // is queued to re-apply. The legacy `adminPassword` key is stripped on this write.
    up: async ({ effects }) => {
      const legacyStore = FileHelper.json(
        { base: sdk.volumes.main, subpath: './store.json' },
        z.object({ adminPassword: z.string().optional().catch(undefined) }),
      )
      const legacy = await legacyStore.read().once()
      await storeJson.merge(effects, {
        adminPasswordSet: legacy?.adminPassword != null,
        pendingAdminPassword: null,
      })
    },
    down: IMPOSSIBLE,
  },
})
