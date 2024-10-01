export interface LogItem {
  id?: string;
  otime: Date;
  type: string;
  sub_type: string;
  session_id: string;
  ascription_id: string;
  data: string;
  path: string;
  platform: string;
}
