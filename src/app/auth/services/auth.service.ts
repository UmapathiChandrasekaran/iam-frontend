import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { RoleLookupService } from './role.lookup.service'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private currentSavedRole = sessionStorage.getItem('X-IAM-ROLE') as 'ADMIN' | 'USER' | null;
  private currentSavedUser = sessionStorage.getItem('X-IAM-USER') || 'Operator';

  private roleSubject = new BehaviorSubject<'ADMIN' | 'USER' | null>(this.currentSavedRole);
  private userSubject = new BehaviorSubject<string>(this.currentSavedUser);

  role$: Observable<'ADMIN' | 'USER' | null> = this.roleSubject.asObservable();
  user$: Observable<string> = this.userSubject.asObservable();

  constructor(
    private roleLookupService: RoleLookupService,
    private router: Router
  ) {}

  /**
   * 🟢 ENTERPRISE LOGIC: Extracts true role from JWT and sets Session
   */
setSession(username: string, sessionId: string) {
    // 1. Save the token and username first
    sessionStorage.setItem('X-IAM-SESSION-ID', sessionId);
    sessionStorage.setItem('X-IAM-USER', username);
    
    // 2. Safely decode the token payload
    try {
      const payloadBase64 = sessionId.split('.')[1];
      const decodedJson = JSON.parse(atob(payloadBase64));
      
      // Extract the role from the JSON payload (e.g., "ROLE_ADMIN" or "ROLE_STANDARD")
      const rawRole = decodedJson.role || '';
      
      // Strip the "ROLE_" prefix to get the clean role name ("ADMIN" or "STANDARD")
      let cleanRole = rawRole.replace('ROLE_', '').toUpperCase();
      
      // Map "STANDARD" or any other variation back to "USER" so the rest of your app doesn't break
      if (cleanRole !== 'ADMIN') {
        cleanRole = 'USER';
      }
      
      const finalRole = cleanRole as 'ADMIN' | 'USER';

      // 3. Save the true role to storage
      sessionStorage.setItem('X-IAM-ROLE', finalRole);

      // 4. Update the reactive streams
      this.roleSubject.next(finalRole);
      this.userSubject.next(username);
      this.roleLookupService.setRole(finalRole);

    } catch (error) {
      console.error("Failed to decode session token payload:", error);
      this.clearSession(); // Security fallback: destroy session if token is unreadable
    }
  }

  getSnapshotRole(): 'ADMIN' | 'USER' | null {
    return this.roleSubject.value;
  }

  /**
   * Erases everything from both memory and storage on exit
   */
  clearSession() {
    sessionStorage.clear(); 
    this.roleSubject.next(null); 
    this.userSubject.next('Operator'); 
    this.roleLookupService.clearRole();
  }

  /**
   * The Master Disconnect Protocol
   */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }
}