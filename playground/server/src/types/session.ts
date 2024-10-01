export interface Session {
    id?: string;
    user_id?: string;
    account?: string;
    ip?: string;
    province?: string;
    path?: string;
    page_title?: string;
    platform?: string;
    stay_time?: number;
    terminal?: string;
    language?: string;
    events?: string;
    breadcrumb?: string;
    user_agent?: string;
    window_size?: string;
    document_size?: string;
    etime?: Date;
    ltime?: Date;
  }
  