import { Notification } from './notification.model';

export class ApiResponse {
  constructor(public alerts: Notification[] = [],
              public data: any[] = [],
              public status: string = '') {
  }
}

