import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.124:0',
  releaseNotes: {
    en_US: `Updated Cronicle to 0.9.124 and rebuilt the package from source.

- Cronicle is now built from the official jhuckaby release instead of the third-party soulteary/cronicle image, which had stalled at 0.9.80 — this closes a large upstream gap and makes future updates a one-line version bump.
- Migrates the package to start-sdk 2.0 (requires StartOS 0.4.0-beta.10 or later). Your existing admin password and schedule are preserved.
- Note: since 0.9.111, a job cannot modify its own event settings unless the server config opts in.

Full release notes: https://github.com/jhuckaby/Cronicle/releases`,
    es_ES: `Actualiza Cronicle a 0.9.124 y recompila el paquete desde el código fuente.

- Cronicle ahora se compila a partir de la versión oficial de jhuckaby en lugar de la imagen de terceros soulteary/cronicle, que se había quedado estancada en 0.9.80: esto cierra una gran brecha con el proyecto original y convierte las futuras actualizaciones en un cambio de una sola línea.
- Migra el paquete a start-sdk 2.0 (requiere StartOS 0.4.0-beta.10 o posterior). Se conservan tu contraseña de administrador y tu programación actuales.
- Nota: desde la versión 0.9.111, una tarea no puede modificar los ajustes de su propio evento a menos que la configuración del servidor lo permita.

Notas de la versión completas: https://github.com/jhuckaby/Cronicle/releases`,
    de_DE: `Aktualisiert Cronicle auf 0.9.124 und baut das Paket aus dem Quellcode neu.

- Cronicle wird jetzt aus der offiziellen jhuckaby-Veröffentlichung gebaut statt aus dem Drittanbieter-Image soulteary/cronicle, das bei 0.9.80 stehen geblieben war — das schließt einen großen Rückstand zum Upstream und macht künftige Aktualisierungen zu einer einzeiligen Versionsänderung.
- Stellt das Paket auf start-sdk 2.0 um (erfordert StartOS 0.4.0-beta.10 oder neuer). Ihr bestehendes Admin-Passwort und Ihr Zeitplan bleiben erhalten.
- Hinweis: Seit 0.9.111 kann ein Job seine eigenen Ereigniseinstellungen nur ändern, wenn die Serverkonfiguration dies zulässt.

Vollständige Versionshinweise: https://github.com/jhuckaby/Cronicle/releases`,
    pl_PL: `Aktualizuje Cronicle do 0.9.124 i przebudowuje pakiet ze źródeł.

- Cronicle jest teraz budowany z oficjalnego wydania jhuckaby zamiast z obrazu innej firmy soulteary/cronicle, który utknął na 0.9.80 — zamyka to dużą lukę względem projektu źródłowego i sprawia, że przyszłe aktualizacje to zmiana jednej linijki.
- Przenosi pakiet na start-sdk 2.0 (wymaga StartOS 0.4.0-beta.10 lub nowszego). Twoje dotychczasowe hasło administratora i harmonogram są zachowane.
- Uwaga: od wersji 0.9.111 zadanie nie może zmieniać ustawień własnego zdarzenia, chyba że konfiguracja serwera na to zezwala.

Pełne informacje o wydaniu: https://github.com/jhuckaby/Cronicle/releases`,
    fr_FR: `Met à jour Cronicle vers 0.9.124 et reconstruit le paquet à partir des sources.

- Cronicle est désormais compilé à partir de la version officielle de jhuckaby au lieu de l'image tierce soulteary/cronicle, restée bloquée à 0.9.80 — cela comble un large retard sur le projet amont et réduit les futures mises à jour à un changement d'une seule ligne.
- Fait passer le paquet à start-sdk 2.0 (nécessite StartOS 0.4.0-beta.10 ou une version ultérieure). Votre mot de passe administrateur et votre planification actuels sont conservés.
- Remarque : depuis la version 0.9.111, une tâche ne peut pas modifier les réglages de son propre événement sauf si la configuration du serveur l'autorise.

Notes de version complètes : https://github.com/jhuckaby/Cronicle/releases`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
