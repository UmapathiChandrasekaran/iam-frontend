import { Component, OnInit } from '@angular/core';
import { RoleLookupService } from '../../services/role.lookup.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // 🌟 ADDED: For Logout

@Component({
  selector: 'app-gateway-landing',
  standalone: false,
  templateUrl: './gateway-landing.html',
  styleUrls: ['./gateway-landing.css']
})
export class GatewayLandingComponent implements OnInit {
  isAdmin: boolean = false;


  // 🌟 ADDED: Injected AuthService
  constructor(
    private roleLookup: RoleLookupService,
    private router: Router,
    private authService: AuthService
  ) { }

  // 🌟 PRESERVED: Synchronize state on startup
  ngOnInit(): void {
    this.synchronizeRoleState();
    this.checkAdminClearance();
  }

  // 🌟 PRESERVED: Original state sync logic
  private synchronizeRoleState(): void {
    const savedRole = sessionStorage.getItem('X-IAM-ROLE') as 'ADMIN' | 'USER' | null;
    if (savedRole) {
      this.roleLookup.setRole(savedRole);
    }
  }

  // 🌟 PRESERVED: Handles click from your original user setting icon box
  proceedToWorkspaceGrid(): void {
    this.synchronizeRoleState();
    this.router.navigate(['/workspace']);
  }

  // 🌟 PRESERVED: Original access lane selector
  selectAccessLane(chosenRole: 'ADMIN' | 'USER') {
    sessionStorage.setItem('X-IAM-ROLE', chosenRole);
    this.roleLookup.setRole(chosenRole);
    this.router.navigate(['/workspace']);
  }

  // ==========================================
  // 🌟 NEW CAPABILITIES FOR SESSION MANAGEMENT
  // ==========================================

  // Routes the user to the AAA Configuration panel
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // Triggers the master wipe in AuthService
  onLogout(): void {
    this.authService.logout();
  }

  private checkAdminClearance(): void {
    // 🌟 Correctly asks the Service, NOT sessionStorage!
    this.isAdmin = (this.roleLookup.currentRole === 'ADMIN');
  }
}