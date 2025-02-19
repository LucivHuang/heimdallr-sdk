import { CustomerOptionType } from "@heimdallr-sdk/types";

export enum CustomerTypes {
  CUSTOMER = 111
}

export interface CustomerOptions {
  customers?: CustomerOptionType[];
}
