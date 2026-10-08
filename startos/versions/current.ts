import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.135:0',
  releaseNotes: {
    en_US: `Updated Cronicle to 0.9.135.

- Security: users only see the jobs, events and live status of the categories and server groups they have access to, and job labels from plugin output are shown as plain text.
- Fix: a chained event no longer runs when it is disabled.
- The HTTP Request plugin keeps the response status code in the job result when response matching fails.
- Cronicle now runs on Node.js 22.
- Updated dependencies with security fixes, including the email library.
- Set Admin Password asks for confirmation before replacing a password that is already set.
- Remove Plugin starts with no plugin selected, and its field description explains how each entry matches a plugin registered in Cronicle.
- The service description names the action that gives you your login details.
- Deploy Node.js Plugin and Remove Plugin show their results and errors in your language.

Full release notes: https://github.com/jhuckaby/Cronicle/releases`,
    es_ES: `Actualiza Cronicle a 0.9.135.

- Seguridad: los usuarios solo ven las tareas, los eventos y el estado en vivo de las categorías y grupos de servidores a los que tienen acceso, y las etiquetas de tarea generadas por los complementos se muestran como texto plano.
- Corrección: un evento encadenado ya no se ejecuta cuando está desactivado.
- El complemento HTTP Request conserva el código de estado de la respuesta en el resultado de la tarea cuando falla la comprobación de la respuesta.
- Cronicle ahora se ejecuta en Node.js 22.
- Dependencias actualizadas con correcciones de seguridad, incluida la biblioteca de correo electrónico.
- Establecer contraseña de administrador pide confirmación antes de reemplazar una contraseña ya establecida.
- Eliminar complemento empieza sin ningún complemento seleccionado, y la descripción de su campo explica cómo cada entrada corresponde a un complemento registrado en Cronicle.
- La descripción del servicio nombra la acción que te da tus credenciales de acceso.
- Desplegar complemento Node.js y Eliminar complemento muestran sus resultados y errores en tu idioma.

Notas de la versión completas: https://github.com/jhuckaby/Cronicle/releases`,
    de_DE: `Aktualisiert Cronicle auf 0.9.135.

- Sicherheit: Benutzer sehen nur noch Jobs, Ereignisse und Live-Status der Kategorien und Servergruppen, auf die sie Zugriff haben, und Job-Labels aus Plugin-Ausgaben werden als reiner Text angezeigt.
- Fehlerbehebung: Ein verkettetes Ereignis wird nicht mehr ausgeführt, wenn es deaktiviert ist.
- Das HTTP-Request-Plugin behält den Statuscode der Antwort im Job-Ergebnis, wenn der Abgleich der Antwort fehlschlägt.
- Cronicle läuft jetzt mit Node.js 22.
- Abhängigkeiten mit Sicherheitskorrekturen aktualisiert, darunter die E-Mail-Bibliothek.
- „Admin-Passwort festlegen“ fragt nach einer Bestätigung, bevor ein bereits festgelegtes Passwort ersetzt wird.
- „Plugin entfernen“ beginnt ohne ausgewähltes Plugin, und die Beschreibung des Feldes erklärt, wie jeder Eintrag einem in Cronicle registrierten Plugin entspricht.
- Die Dienstbeschreibung nennt die Aktion, die dir deine Zugangsdaten liefert.
- „Node.js-Plugin bereitstellen“ und „Plugin entfernen“ zeigen ihre Ergebnisse und Fehler in deiner Sprache an.

Vollständige Versionshinweise: https://github.com/jhuckaby/Cronicle/releases`,
    pl_PL: `Aktualizuje Cronicle do 0.9.135.

- Bezpieczeństwo: użytkownicy widzą tylko zadania, zdarzenia i status na żywo kategorii i grup serwerów, do których mają dostęp, a etykiety zadań pochodzące z wtyczek są wyświetlane jako zwykły tekst.
- Poprawka: zdarzenie łańcuchowe nie uruchamia się już, gdy jest wyłączone.
- Wtyczka HTTP Request zachowuje kod statusu odpowiedzi w wyniku zadania, gdy dopasowanie odpowiedzi się nie powiedzie.
- Cronicle działa teraz na Node.js 22.
- Zaktualizowano zależności z poprawkami bezpieczeństwa, w tym bibliotekę poczty e-mail.
- „Ustaw hasło administratora” prosi o potwierdzenie przed zastąpieniem już ustawionego hasła.
- „Usuń wtyczkę” zaczyna bez wybranej wtyczki, a opis pola wyjaśnia, jak każda pozycja odpowiada wtyczce zarejestrowanej w Cronicle.
- Opis usługi podaje akcję, która zwraca dane logowania.
- „Wdróż wtyczkę Node.js” i „Usuń wtyczkę” pokazują wyniki i błędy w Twoim języku.

Pełne informacje o wydaniu: https://github.com/jhuckaby/Cronicle/releases`,
    fr_FR: `Met à jour Cronicle vers 0.9.135.

- Sécurité : les utilisateurs ne voient que les tâches, les événements et l'état en direct des catégories et groupes de serveurs auxquels ils ont accès, et les libellés de tâche issus des plugins s'affichent en texte brut.
- Correctif : un événement chaîné ne s'exécute plus lorsqu'il est désactivé.
- Le plugin HTTP Request conserve le code d'état de la réponse dans le résultat de la tâche lorsque la vérification de la réponse échoue.
- Cronicle fonctionne désormais sous Node.js 22.
- Dépendances mises à jour avec des correctifs de sécurité, dont la bibliothèque de courriel.
- Définir le mot de passe administrateur demande une confirmation avant de remplacer un mot de passe déjà défini.
- Supprimer le plugin démarre sans plugin sélectionné, et la description de son champ explique comment chaque entrée correspond à un plugin enregistré dans Cronicle.
- La description du service indique l'action qui vous donne vos identifiants de connexion.
- Déployer un plugin Node.js et Supprimer le plugin affichent leurs résultats et erreurs dans votre langue.

Notes de version complètes : https://github.com/jhuckaby/Cronicle/releases`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
