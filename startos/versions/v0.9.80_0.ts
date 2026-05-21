import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_0_9_80_0 = VersionInfo.of({
  version: '0.9.80:0',
  releaseNotes: {
    en_US: 'Initial release of Cronicle for StartOS',
    es_ES: 'Lanzamiento inicial de Cronicle para StartOS',
    de_DE: 'Erstveröffentlichung von Cronicle für StartOS',
    pl_PL: 'Pierwsze wydanie Cronicle dla StartOS',
    fr_FR: 'Version initiale de Cronicle pour StartOS',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
