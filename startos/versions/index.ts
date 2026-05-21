import { VersionGraph } from '@start9labs/start-sdk'
import { v_0_9_80_2 } from './v0.9.80_2'
import { v_0_9_80_0 } from './v0.9.80_0'

export const versionGraph = VersionGraph.of({
  current: v_0_9_80_2,
  other: [v_0_9_80_0],
})
