import { Notification } from './notification.model';

export interface ApiResponse {
    alerts: Array<Notification>;
    data: Array<any>;
    status: string;
}

