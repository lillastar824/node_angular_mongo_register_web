import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AtsignService {

  constructor(private http: HttpClient) { }

  updateAtsignSettings(data) {
    return this.http.post(environment.apiBaseUrl + '/atsign-advance-setting', data);
  }
}
