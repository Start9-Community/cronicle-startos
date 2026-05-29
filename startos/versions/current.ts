import { FileHelper, IMPOSSIBLE, VersionInfo, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

export const current = VersionInfo.of({
  version: '0.9.80:3',
  releaseNotes: {
    en_US:
      'Fixes the admin password being re-applied on every restart, which silently reverted any password changed inside Cronicle.',
    es_ES:
      'Corrige que la contraseña de administrador se reaplicara en cada reinicio, lo que revertía silenciosamente cualquier contraseña cambiada dentro de Cronicle.',
    de_DE:
      'Behebt, dass das Admin-Passwort bei jedem Neustart erneut angewendet wurde, wodurch ein innerhalb von Cronicle geändertes Passwort stillschweigend zurückgesetzt wurde.',
    pl_PL:
      'Naprawia ponowne stosowanie hasła administratora przy każdym restarcie, co po cichu cofało hasło zmienione wewnątrz Cronicle.',
    fr_FR:
      "Corrige la réapplication du mot de passe administrateur à chaque redémarrage, qui annulait silencieusement tout mot de passe modifié dans Cronicle.",
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
