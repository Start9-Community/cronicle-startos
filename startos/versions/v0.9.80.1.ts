import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_9_80_1 = VersionInfo.of({
  version: '0.9.80:1',
  releaseNotes: {
    en_US: 'Internal updates (start-sdk 1.3.2)',
    es_ES: 'Actualizaciones internas (start-sdk 1.3.2)',
    de_DE: 'Interne Updates (start-sdk 1.3.2)',
    pl_PL: 'Wewnętrzne aktualizacje (start-sdk 1.3.2)',
    fr_FR: 'Mises à jour internes (start-sdk 1.3.2)',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
