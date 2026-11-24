import { randomBytes } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '0.9.135:7',
  releaseNotes: {
    en_US: `Cronicle's secret key is now unique to each server. This update replaces the existing key with a new random one. If you run external worker servers, copy the new key from the Show Secret Key action onto each of them after updating; until then they cannot authenticate. Previously issued job-log links stop working; reopen the logs in Cronicle to get new links.`,
    es_ES: `La clave secreta de Cronicle ahora es única para cada servidor. Esta actualización reemplaza la clave existente por una nueva generada al azar. Si usas servidores de trabajo externos, copia la nueva clave desde la acción Mostrar clave secreta en cada uno de ellos después de actualizar; hasta entonces no podrán autenticarse. Los enlaces a registros de tareas emitidos anteriormente dejan de funcionar; vuelve a abrir los registros en Cronicle para obtener enlaces nuevos.`,
    de_DE: `Der geheime Schlüssel von Cronicle ist jetzt für jeden Server eindeutig. Dieses Update ersetzt den bestehenden Schlüssel durch einen neuen, zufällig erzeugten. Wenn du externe Worker-Server betreibst, kopiere nach dem Update den neuen Schlüssel aus der Aktion „Geheimen Schlüssel anzeigen“ auf jeden von ihnen; bis dahin können sie sich nicht authentifizieren. Bisherige Job-Protokolllinks funktionieren nicht mehr; öffne die Protokolle in Cronicle erneut, um neue Links zu erhalten.`,
    pl_PL: `Tajny klucz Cronicle jest teraz unikalny dla każdego serwera. Ta aktualizacja zastępuje istniejący klucz nowym, losowo wygenerowanym. Jeśli używasz zewnętrznych serwerów wykonawczych, po aktualizacji skopiuj nowy klucz z akcji „Pokaż tajny klucz” na każdy z nich; do tego czasu nie będą mogły się uwierzytelnić. Dotychczasowe odnośniki do dzienników zadań przestają działać; otwórz dzienniki ponownie w Cronicle, aby uzyskać nowe odnośniki.`,
    fr_FR: `La clé secrète de Cronicle est désormais propre à chaque serveur. Cette mise à jour remplace la clé existante par une nouvelle clé aléatoire. Si vous utilisez des serveurs de travail externes, copiez la nouvelle clé depuis l'action Afficher la clé secrète sur chacun d'eux après la mise à jour ; d'ici là, ils ne pourront pas s'authentifier. Les anciens liens vers les journaux des tâches ne fonctionnent plus ; rouvrez les journaux dans Cronicle pour obtenir de nouveaux liens.`,
  },
  migrations: {
    up: async () => {
      const configPath = sdk.volumes.main.subpath('conf/config.json')
      const config = await readFile(configPath, 'utf8').catch(
        (error: NodeJS.ErrnoException) => {
          if (error.code === 'ENOENT') return null
          throw error
        },
      )
      if (config === null) return
      await writeFile(
        configPath,
        JSON.stringify(
          {
            ...JSON.parse(config),
            secret_key: randomBytes(32).toString('hex'),
          },
          null,
          '\t',
        ),
      )
    },
    down: IMPOSSIBLE,
  },
})
