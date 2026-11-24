import { randomBytes } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '0.9.135:7',
  releaseNotes: {
    en_US: `Cronicle's secret key is now unique to each server. This update replaces the existing key with a new random one.`,
    es_ES: `La clave secreta de Cronicle ahora es única para cada servidor. Esta actualización reemplaza la clave existente por una nueva generada al azar.`,
    de_DE: `Der geheime Schlüssel von Cronicle ist jetzt für jeden Server eindeutig. Dieses Update ersetzt den bestehenden Schlüssel durch einen neuen, zufällig erzeugten.`,
    pl_PL: `Tajny klucz Cronicle jest teraz unikalny dla każdego serwera. Ta aktualizacja zastępuje istniejący klucz nowym, losowo wygenerowanym.`,
    fr_FR: `La clé secrète de Cronicle est désormais propre à chaque serveur. Cette mise à jour remplace la clé existante par une nouvelle clé aléatoire.`,
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
