import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleLookupService {
  // Holds the active role state: 'ADMIN', 'USER', or null (not selected yet)
  private roleSubject = new BehaviorSubject<'ADMIN' | 'USER' | null>(null);

  // Observables allow other components to listen to changes reactively
  public currentRole$ = this.roleSubject.asObservable();

  constructor() { }

  // Sets the role globally when a card is clicked on the landing page
  setRole(role: 'ADMIN' | 'USER'): void {
    this.roleSubject.next(role);
  }

  // Quick synchronous getter to check the current role value instantly
  get currentRole(): 'ADMIN' | 'USER' | null {
    return this.roleSubject.value;
  }

  // Clears the role state to return to the landing page
  clearRole(): void {
    this.roleSubject.next(null);
  }

  // 🟢 REAL ENTERPRISE LOGIC: Extracts the true role injected by Spring Boot
  getRoleFromToken(token: string): string {
    if (!token) return 'USER';

    try {
      // A JWT has 3 parts: Header.Payload.Signature
      const payloadBase64 = token.split('.')[1]; 
      
      // Decode the Base64 payload into a JSON string
      const decodedJson = atob(payloadBase64); 
      const decodedPayload = JSON.parse(decodedJson);

      // Extract the role claim (adjust 'userType' if your JwtUtils uses a different key)
      const rawRole = decodedPayload.role || decodedPayload.userType || 'USER';
      
      // Ensure it matches your UI expectations (e.g., 'ROLE_ADMIN' -> 'ADMIN')
      return rawRole.replace('ROLE_', '').toUpperCase();

    } catch (error) {
      console.error('Failed to parse JWT payload', error);
      return 'USER'; // Default fallback
    }
  }
}