import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.135:1',
  releaseNotes: {
    en_US:
      'Updated start-sdk to 3.0.4 and patched the shell-quote dependency against command injection (GHSA-pqg4-j6r4-53mv). Fixed a browser-bundle build race. Corrected first-run setup and SMTP instructions and removed one-time upgrade guidance.',
    es_ES:
      'Actualiza start-sdk a 3.0.4 y corrige la dependencia shell-quote contra la inyección de comandos (GHSA-pqg4-j6r4-53mv). Corrige una condición de carrera al compilar los archivos del navegador. Corrige las instrucciones de configuración inicial y SMTP y elimina las indicaciones para una actualización puntual.',
    de_DE:
      'Aktualisiert start-sdk auf 3.0.4 und behebt die Befehlsinjektion in der Abhängigkeit shell-quote (GHSA-pqg4-j6r4-53mv). Behebt eine Race Condition beim Erstellen der Browser-Dateien. Korrigiert die Anleitung zur Ersteinrichtung und zu SMTP und entfernt einmalige Upgrade-Hinweise.',
    pl_PL:
      'Zaktualizowano start-sdk do 3.0.4 i poprawiono zależność shell-quote, aby zapobiec wstrzykiwaniu poleceń (GHSA-pqg4-j6r4-53mv). Naprawiono wyścig podczas budowania plików przeglądarki. Poprawiono instrukcje pierwszej konfiguracji i SMTP oraz usunięto wskazówki dotyczące jednorazowej aktualizacji.',
    fr_FR:
      'Met à jour start-sdk vers 3.0.4 et corrige la dépendance shell-quote contre l’injection de commandes (GHSA-pqg4-j6r4-53mv). Corrige une condition de concurrence lors de la compilation des fichiers du navigateur. Corrige les instructions de configuration initiale et SMTP et supprime les consignes de mise à niveau ponctuelle.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
