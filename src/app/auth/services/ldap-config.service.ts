import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LdapConfigService {
    private baseApiUrl = environment.authApiUrl;
  private apiUrl = this.baseApiUrl+'/api/ldap-config';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('X-IAM-SESSION-ID') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-IAM-SESSION-ID': token
    });
  }

  getConfigurations(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() });
  }

  saveConfigurations(config: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, config, { headers: this.getHeaders() });
  }
}