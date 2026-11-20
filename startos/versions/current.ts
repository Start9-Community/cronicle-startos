import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.135:6',
  releaseNotes: {
    en_US: `Packaging update: the Cronicle source is checked against the exact release before it is built. Nothing changes in how Cronicle runs.`,
    es_ES: `Actualización del empaquetado: el código fuente de Cronicle se verifica contra la versión exacta antes de compilarse. No cambia nada en el funcionamiento de Cronicle.`,
    de_DE: `Paketierungs-Update: Der Cronicle-Quellcode wird vor dem Bauen gegen die exakte Version geprüft. An der Funktionsweise von Cronicle ändert sich nichts.`,
    pl_PL: `Aktualizacja pakietu: kod źródłowy Cronicle jest sprawdzany względem dokładnego wydania przed kompilacją. Działanie Cronicle się nie zmienia.`,
    fr_FR: `Mise à jour de l'empaquetage : le code source de Cronicle est vérifié par rapport à la version exacte avant d'être compilé. Rien ne change dans le fonctionnement de Cronicle.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
