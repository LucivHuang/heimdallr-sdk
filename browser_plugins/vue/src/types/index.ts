import { VueInstance } from "@heimdallr-sdk/types"

export enum VueTypes {
  ERROR = 91
}

export interface VueOptions {
  /**
   * vue实例
   */
  vue?: VueInstance
}
