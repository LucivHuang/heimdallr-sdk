import { AppInfoType } from "@heimdallr-sdk/types";

export interface CoreContextType {
  app: AppInfoType;
  uploadUrl: string;
  initUrl: string;
  debug: boolean;
  enabled: boolean;
}
