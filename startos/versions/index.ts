import { VersionGraph } from '@start9labs/start-sdk'
import { v_0_9_80_1 } from './v0.9.80.1'
import { v_0_9_80_0 } from './v0.9.80.0'

export const versionGraph = VersionGraph.of({
  current: v_0_9_80_1,
  other: [v_0_9_80_0],
})
