import { Component, OnInit } from '@angular/core'; 
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoleLookupService } from '../../services/role.lookup.service';

@Component({
  selector: 'app-aaa-workspace',
  standalone: false,
  templateUrl: './aaa-workspace.component.html',
  styleUrl: './aaa-workspace.component.css',
})
export class AaaWorkspaceComponent implements OnInit {
  activeTab: string = 'ldap';
  isAdmin: boolean = false; 

  constructor(
    private router: Router,
    private authService: AuthService,
    private roleLookup: RoleLookupService // 🌟 INJECTED SERVICE
  ) {}

  ngOnInit(): void {
    // 🌟 1. F5 Refresh Protection: If the service is empty but storage isn't, re-hydrate the service.
    const savedRole = sessionStorage.getItem('X-IAM-ROLE') as 'ADMIN' | 'USER' | null;
    if (savedRole && !this.roleLookup.currentRole) {
      this.roleLookup.setRole(savedRole);
    }

    // 🌟 2. Verify admin clearance strictly using your state service
    this.isAdmin = (this.roleLookup.currentRole === 'ADMIN');

    // 🌟 3. Kick out intruders
    if (!this.isAdmin) {
      console.warn('[SECURITY BREACH] Non-Admin user attempted to access AAA Workspace.');
    }
  }

  setTab(tabName: string): void {
    this.activeTab = tabName;
  }

  goToGateway(): void {
    this.router.navigate(['/gateway']);
  }

  onLogout(): void {
    this.authService.logout();
  }
}