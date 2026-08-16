export interface BreadCrumb {
  lid: string;
  bt: string;
  msg: string;
  t: number;
  l?: string;
}

export interface BreadCrumbRes {
  id: string;
  event_id: string;
  type: string;
  message: string;
  level: string;
  time: string;
}
