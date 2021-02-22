import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommissionService {

  constructor(private http: HttpClient) { }

  getCommercialAtsignCommission(params) {
    return this.http.get(`${environment.apiBaseUrl}/user-commission/atsign`, { params });
  }

  getCommissionRepotsDetails(params) {
    return this.http.get(`${environment.apiBaseUrl}/user-commission/`, { params });
  }
}
