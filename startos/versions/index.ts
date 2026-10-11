import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_0_9_135_0 } from './v0.9.135_0'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_0_9_135_0],
})
