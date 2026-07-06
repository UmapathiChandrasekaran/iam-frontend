import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
private apiUrl = environment.authApiUrl;
  private baseApiUrl = this.apiUrl+'/api/users';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-IAM-SESSION-ID': sessionStorage.getItem('X-IAM-SESSION-ID') || ''
    });
  }

  // Maps to: @GetMapping("/me")
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/me`, { headers: this.getHeaders() });
  }

  // Maps to: @GetMapping("/list")
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseApiUrl}/list`, { headers: this.getHeaders() });
  }

  // Maps to: @PostMapping("/add")
  addUser(user: any): Observable<string> {
    return this.http.post(`${this.baseApiUrl}/add`, user, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  // Maps to: @PutMapping("/edit")
  editUser(user: any): Observable<string> {
    return this.http.put(`${this.baseApiUrl}/edit`, user, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  // Maps to: @DeleteMapping("/delete/{id}")
  deleteUser(userId: number): Observable<string> {
    return this.http.delete(`${this.baseApiUrl}/delete/${userId}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  // 🌟 Maps to: @PostMapping("/block/{id}")
  blockUser(userId: number): Observable<string> {
    return this.http.post(`${this.baseApiUrl}/block/${userId}`, {}, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }
  unblockUser(userId: number): Observable<string> {
    return this.http.post(`${this.baseApiUrl}/unblock/${userId}`, {}, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  changePassword(payload: { currentPassword: string, newPassword: string }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-IAM-SESSION-ID': sessionStorage.getItem('X-IAM-SESSION-ID') || ''
    });

    return this.http.post(`${this.baseApiUrl}/change-password`, payload, {
      headers,
      responseType: 'text'
    });
  }


  getMfaSetup(): Observable<{ secret: string; manualConfigString: string; qrCodeDataUrl: string }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-IAM-SESSION-ID': sessionStorage.getItem('X-IAM-SESSION-ID') || ''
    });

    // Ensure the generic type payload inside the get<...> call matches the return signature
    return this.http.get<{ secret: string; manualConfigString: string; qrCodeDataUrl: string }>(
      `${this.baseApiUrl}/mfa/setup`,
      { headers }
    );
  }

  verifyMfa(code: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-IAM-SESSION-ID': sessionStorage.getItem('X-IAM-SESSION-ID') || ''
    });
    return this.http.post(
      `${this.baseApiUrl}/mfa/verify`,
      { code },
      { headers, responseType: 'text' }
    );
  }


  adminDisableMfa(username: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-IAM-SESSION-ID': sessionStorage.getItem('X-IAM-SESSION-ID') || ''
    });
    return this.http.post(`${this.baseApiUrl}/mfa/disable-override`, { username }, { headers, responseType: 'text' });
  }

  adminForcePassword(username: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-IAM-SESSION-ID': sessionStorage.getItem('X-IAM-SESSION-ID') || ''
    });
    return this.http.post(`${this.baseApiUrl}/force-password-override`, { username, newPassword }, { headers, responseType: 'text' });
  }

  // 🟢 ADD THIS METHOD: Commits the successful login data to browser storage
  setSession(username: string, role: string, token: string): void {
    sessionStorage.setItem('X-IAM-SESSION-ID', token);
    sessionStorage.setItem('X-IAM-USERNAME', username);
    sessionStorage.setItem('X-IAM-ROLE', role);
  }
}