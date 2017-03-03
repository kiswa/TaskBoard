import { Notification } from './notification.model';

export class ApiResponse {
    constructor(public alerts: Array<Notification> = [],
                public data: Array<any> = [],
                public status: string = '') {
    }
}

