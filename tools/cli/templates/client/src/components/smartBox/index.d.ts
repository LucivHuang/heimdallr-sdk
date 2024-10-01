type Method = "jsonp" | "get" | "post";

export interface InputConfig {
  method?: string;
  searchKey?: string;
  targetPath?: string;
  nameKey?: string;
  idKey?: string;
  url?: string;
  defaultParam?: { [key: string]: string | number };
  showId?: boolean;
}