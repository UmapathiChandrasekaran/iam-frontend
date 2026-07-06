import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  
  // Storage fields for managing components runtime state
  currentToken: string | null = '';
  
  // Template dataset simulating LDAP directory objects for context mapping
  userList: Array<{ dn: string; username: string; roles: string[] }> = [
    { dn: 'cn=admin,dc=maximus,dc=com', username: 'admin_root', roles: ['ADMIN', 'USER'] },
    { dn: 'uid=user01,ou=people,dc=maximus,dc=com', username: 'max_developer', roles: ['USER'] }
  ];

  constructor(private router: Router) {}

  // Lifecycle hook executed right after component initialization
  ngOnInit(): void {
    // 1. Intercept browser storage data arrays
    this.currentToken = sessionStorage.getItem('X-IAM-SESSION-ID');

    // 2. Client-Side Primitive Route Protection Gate
    if (!this.currentToken) {
      console.warn('Security Interceptor: No active session. Re-routing access request to login.');
      this.router.navigate(['/login']);
    }
  }

  // Method to remove a target user tracking instance from current layout state
  onRevokeUser(targetUsername: string): void {
    this.userList = this.userList.filter(user => user.username !== targetUsername);
    console.log(`Action Logged: Revoked local execution memory clearance for user: ${targetUsername}`);
  }

  // Method to purge structural token and restore default access permissions
  onLogout(): void {
    // 1. Wipe out active memory allocations from browser storage
    sessionStorage.removeItem('X-IAM-SESSION-ID');
    
    // 2. Wipe locally bound tracking property
    this.currentToken = null;

    // 3. Force routing perimeter to slide backward to security gate
    this.router.navigate(['/login']);
    console.log('Action Logged: Session memory state finalized. Redirection complete.');
  }
}
