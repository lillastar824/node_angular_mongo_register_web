import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private http: HttpClient) { }

  baseURl = environment.apiBaseUrl;
  
  getNotifications() {
    return this.http.get(`${this.baseURl}/notifications`)
  }

  getUnreadNotifications() {
    return this.http.get(`${this.baseURl}/unreadNotifications`)
  }

  markNotificationsAsRead(body) {
    return this.http.post(`${this.baseURl}/markNotificationsAsRead`, body)
  }

}
