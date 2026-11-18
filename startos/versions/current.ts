import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.135:5',
  releaseNotes: {
    en_US: `Updates Node.js to 22.23.5 with the November 2026 security fixes.`,
    es_ES: `Actualiza Node.js a 22.23.5 con las correcciones de seguridad de noviembre de 2026.`,
    de_DE: `Aktualisiert Node.js auf 22.23.5 mit den Sicherheitskorrekturen vom November 2026.`,
    pl_PL: `Aktualizuje Node.js do wersji 22.23.5 z poprawkami bezpieczeństwa z listopada 2026 r.`,
    fr_FR: `Met à jour Node.js vers 22.23.5 avec les correctifs de sécurité de novembre 2026.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
