import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.122:0',
  releaseNotes: {
    en_US:
      'Updated Cronicle to 0.9.122.\n\n' +
      'This package now builds Cronicle from source (the official jhuckaby/Cronicle release), replacing the third-party image that had stalled at 0.9.80 — so future updates can track upstream directly. Everything since 0.9.80 is dependency, security, and bug-fix patches; your existing schedules, job history, and users carry over unchanged.\n\n' +
      'Note: since 0.9.111, a job can no longer modify its own event settings unless the server config enables it. This affects only advanced setups that rely on that behavior.\n\n' +
      'Full changelog: https://github.com/jhuckaby/Cronicle/blob/master/CHANGELOG.md\n\n' +
      'Also includes internal updates for start-sdk 2.0.',
    es_ES:
      'Cronicle actualizado a 0.9.122.\n\n' +
      'Este paquete ahora compila Cronicle desde el código fuente (la versión oficial de jhuckaby/Cronicle), reemplazando la imagen de terceros que se había quedado en 0.9.80, para poder seguir las actualizaciones de forma directa. Todo lo posterior a 0.9.80 son parches de dependencias, seguridad y corrección de errores; tus programaciones, historial de trabajos y usuarios se conservan sin cambios.\n\n' +
      'Nota: desde 0.9.111, un trabajo ya no puede modificar la configuración de su propio evento salvo que la configuración del servidor lo habilite. Solo afecta a configuraciones avanzadas que dependan de ese comportamiento.\n\n' +
      'Registro de cambios completo: https://github.com/jhuckaby/Cronicle/blob/master/CHANGELOG.md\n\n' +
      'También incluye actualizaciones internas para start-sdk 2.0.',
    de_DE:
      'Cronicle wurde auf 0.9.122 aktualisiert.\n\n' +
      'Dieses Paket baut Cronicle nun aus dem Quellcode (der offiziellen Version von jhuckaby/Cronicle) und ersetzt das Drittanbieter-Image, das bei 0.9.80 stehen geblieben war — künftige Updates folgen damit direkt dem Upstream. Alles seit 0.9.80 sind Abhängigkeits-, Sicherheits- und Fehlerkorrektur-Patches; Ihre Zeitpläne, Ihr Auftragsverlauf und Ihre Benutzer bleiben unverändert erhalten.\n\n' +
      'Hinweis: Seit 0.9.111 kann ein Auftrag seine eigenen Ereignis-Einstellungen nicht mehr ändern, sofern die Serverkonfiguration dies nicht erlaubt. Betrifft nur fortgeschrittene Setups, die auf dieses Verhalten angewiesen sind.\n\n' +
      'Vollständiges Changelog: https://github.com/jhuckaby/Cronicle/blob/master/CHANGELOG.md\n\n' +
      'Enthält außerdem interne Aktualisierungen für start-sdk 2.0.',
    pl_PL:
      'Zaktualizowano Cronicle do 0.9.122.\n\n' +
      'Ten pakiet buduje teraz Cronicle ze źródeł (oficjalne wydanie jhuckaby/Cronicle), zastępując obraz innej firmy, który zatrzymał się na 0.9.80 — dzięki czemu kolejne aktualizacje mogą śledzić upstream bezpośrednio. Wszystko po 0.9.80 to poprawki zależności, bezpieczeństwa i błędów; Twoje harmonogramy, historia zadań i użytkownicy pozostają bez zmian.\n\n' +
      'Uwaga: od 0.9.111 zadanie nie może już modyfikować ustawień własnego zdarzenia, chyba że zezwoli na to konfiguracja serwera. Dotyczy to tylko zaawansowanych konfiguracji zależnych od tego zachowania.\n\n' +
      'Pełny dziennik zmian: https://github.com/jhuckaby/Cronicle/blob/master/CHANGELOG.md\n\n' +
      'Zawiera również wewnętrzne aktualizacje dla start-sdk 2.0.',
    fr_FR:
      'Cronicle a été mis à jour vers 0.9.122.\n\n' +
      'Ce paquet compile désormais Cronicle depuis les sources (la version officielle de jhuckaby/Cronicle), remplaçant l’image tierce restée bloquée à 0.9.80 — les futures mises à jour peuvent ainsi suivre directement l’amont. Tout ce qui suit 0.9.80 relève de correctifs de dépendances, de sécurité et de bogues ; vos planifications, votre historique de tâches et vos utilisateurs sont conservés à l’identique.\n\n' +
      'Remarque : depuis 0.9.111, une tâche ne peut plus modifier les paramètres de son propre événement sauf si la configuration du serveur l’autorise. Cela ne concerne que les configurations avancées qui reposent sur ce comportement.\n\n' +
      'Journal des modifications complet : https://github.com/jhuckaby/Cronicle/blob/master/CHANGELOG.md\n\n' +
      'Comprend également des mises à jour internes pour start-sdk 2.0.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
