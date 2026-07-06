import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OidcConfigService {
  private baseApiUrl = environment.authApiUrl;
  private apiUrl = this.baseApiUrl+'/api/config/oidc';

  constructor(private http: HttpClient) {}

  getConfig(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  updateConfig(configData: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, configData);
  }
}