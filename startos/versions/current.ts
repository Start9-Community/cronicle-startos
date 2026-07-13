import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.123:0',
  releaseNotes: {
    en_US: `Updated Cronicle to 0.9.123.

- Replaces the unmaintained bcrypt-node password-hashing library with the maintained bcryptjs. Your existing admin password keeps working — there is nothing to reset.

Full release notes: https://github.com/jhuckaby/Cronicle/releases/tag/v0.9.123`,
    es_ES: `Actualiza Cronicle a 0.9.123.

- Sustituye la biblioteca de cifrado de contraseñas bcrypt-node, ya sin mantenimiento, por bcryptjs, que sí se mantiene. Tu contraseña de administrador actual sigue funcionando: no hay nada que restablecer.

Notas de la versión completas: https://github.com/jhuckaby/Cronicle/releases/tag/v0.9.123`,
    de_DE: `Aktualisiert Cronicle auf 0.9.123.

- Ersetzt die nicht mehr gepflegte Passwort-Hashing-Bibliothek bcrypt-node durch das gepflegte bcryptjs. Ihr bestehendes Admin-Passwort funktioniert weiterhin — es muss nichts zurückgesetzt werden.

Vollständige Versionshinweise: https://github.com/jhuckaby/Cronicle/releases/tag/v0.9.123`,
    pl_PL: `Aktualizuje Cronicle do 0.9.123.

- Zastępuje nieutrzymywaną bibliotekę haszowania haseł bcrypt-node utrzymywaną biblioteką bcryptjs. Twoje dotychczasowe hasło administratora nadal działa — nie trzeba go resetować.

Pełne informacje o wydaniu: https://github.com/jhuckaby/Cronicle/releases/tag/v0.9.123`,
    fr_FR: `Met à jour Cronicle vers 0.9.123.

- Remplace la bibliothèque de hachage de mots de passe bcrypt-node, qui n'est plus maintenue, par bcryptjs, qui l'est. Votre mot de passe administrateur actuel continue de fonctionner : il n'y a rien à réinitialiser.

Notes de version complètes : https://github.com/jhuckaby/Cronicle/releases/tag/v0.9.123`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
