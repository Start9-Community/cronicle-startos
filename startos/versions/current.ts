import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.124:3',
  releaseNotes: {
    en_US: `- Set Admin Password asks for confirmation before replacing a password that is already set.
- Remove Plugin starts with no plugin selected, and its field description explains how each entry matches a plugin registered in Cronicle.
- The service description names the action that gives you your login details.
- Deploy Node.js Plugin and Remove Plugin show their results and errors in your language.`,
    es_ES: `- Establecer contraseña de administrador pide confirmación antes de reemplazar una contraseña ya establecida.
- Eliminar complemento empieza sin ningún complemento seleccionado, y la descripción de su campo explica cómo cada entrada corresponde a un complemento registrado en Cronicle.
- La descripción del servicio nombra la acción que te da tus credenciales de acceso.
- Desplegar complemento Node.js y Eliminar complemento muestran sus resultados y errores en tu idioma.`,
    de_DE: `- „Admin-Passwort festlegen“ fragt nach einer Bestätigung, bevor ein bereits festgelegtes Passwort ersetzt wird.
- „Plugin entfernen“ beginnt ohne ausgewähltes Plugin, und die Beschreibung des Feldes erklärt, wie jeder Eintrag einem in Cronicle registrierten Plugin entspricht.
- Die Dienstbeschreibung nennt die Aktion, die dir deine Zugangsdaten liefert.
- „Node.js-Plugin bereitstellen“ und „Plugin entfernen“ zeigen ihre Ergebnisse und Fehler in deiner Sprache an.`,
    pl_PL: `- „Ustaw hasło administratora” prosi o potwierdzenie przed zastąpieniem już ustawionego hasła.
- „Usuń wtyczkę” zaczyna bez wybranej wtyczki, a opis pola wyjaśnia, jak każda pozycja odpowiada wtyczce zarejestrowanej w Cronicle.
- Opis usługi podaje akcję, która zwraca dane logowania.
- „Wdróż wtyczkę Node.js” i „Usuń wtyczkę” pokazują wyniki i błędy w Twoim języku.`,
    fr_FR: `- Définir le mot de passe administrateur demande une confirmation avant de remplacer un mot de passe déjà défini.
- Supprimer le plugin démarre sans plugin sélectionné, et la description de son champ explique comment chaque entrée correspond à un plugin enregistré dans Cronicle.
- La description du service indique l'action qui vous donne vos identifiants de connexion.
- Déployer un plugin Node.js et Supprimer le plugin affichent leurs résultats et erreurs dans votre langue.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
