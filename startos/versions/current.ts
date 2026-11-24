import { randomBytes } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '0.9.135:7',
  releaseNotes: {
    en_US: `Cronicle's secret key is now unique to each server. This update replaces the existing key with a new random one. External workers stop authenticating until they are configured with the new key. Previously issued job-log links stop working; reopen the logs in Cronicle to get new links.`,
    es_ES: `La clave secreta de Cronicle ahora es única para cada servidor. Esta actualización reemplaza la clave existente por una nueva generada al azar. Los servidores de trabajo externos dejan de autenticarse hasta que se configuren con la nueva clave. Los enlaces a registros de tareas emitidos anteriormente dejan de funcionar; vuelve a abrir los registros en Cronicle para obtener enlaces nuevos.`,
    de_DE: `Der geheime Schlüssel von Cronicle ist jetzt für jeden Server eindeutig. Dieses Update ersetzt den bestehenden Schlüssel durch einen neuen, zufällig erzeugten. Externe Worker können sich erst wieder authentifizieren, nachdem sie mit dem neuen Schlüssel konfiguriert wurden. Bisherige Job-Protokolllinks funktionieren nicht mehr; öffne die Protokolle in Cronicle erneut, um neue Links zu erhalten.`,
    pl_PL: `Tajny klucz Cronicle jest teraz unikalny dla każdego serwera. Ta aktualizacja zastępuje istniejący klucz nowym, losowo wygenerowanym. Zewnętrzne serwery wykonawcze przestają się uwierzytelniać do czasu skonfigurowania ich z nowym kluczem. Dotychczasowe odnośniki do dzienników zadań przestają działać; otwórz dzienniki ponownie w Cronicle, aby uzyskać nowe odnośniki.`,
    fr_FR: `La clé secrète de Cronicle est désormais propre à chaque serveur. Cette mise à jour remplace la clé existante par une nouvelle clé aléatoire. Les serveurs de travail externes ne peuvent plus s'authentifier tant qu'ils ne sont pas configurés avec la nouvelle clé. Les anciens liens vers les journaux des tâches ne fonctionnent plus ; rouvrez les journaux dans Cronicle pour obtenir de nouveaux liens.`,
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
