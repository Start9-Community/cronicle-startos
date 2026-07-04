import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'cronicle',
  title: 'Cronicle',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9-Community/cronicle-startos',
  upstreamRepo: 'https://github.com/jhuckaby/Cronicle',
  marketingUrl: 'https://cronicle.net/',
  donationUrl: null,
  docsUrls: ['https://github.com/jhuckaby/Cronicle/blob/master/docs/WebUI.md'],
  description: { short, long },
  volumes: ['main'],
  images: {
    cronicle: {
      source: { dockerTag: 'soulteary/cronicle:0.9.80' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
