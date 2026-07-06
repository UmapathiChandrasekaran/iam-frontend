import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { RoleLookupService } from '../../services/role.lookup.service';

@Component({
  selector: 'app-console-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './console-workspace.html',
  styleUrls: ['./console-workspace.css']
})
export class ConsoleWorkspace implements OnInit {
  users: any[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  isAdmin: boolean = false;

  roleOptions: string[] = ['USER', 'ADMIN'];

  formModel: any = { username: '', password: '', userType: 'USER' };
  editingUserId: any = null;
  editBuffer: any = { id: null, username: '', userType: '' };
  currentPassword: any;
  newPassword: any;
  forcePasswordModel: { [key: number]: string } = {};

  mfaSecret: string | null = null;
  mfaConfigString: string | null = null;
  qrCodeDataUrl: string | null = null;
  mfaVerificationCode: string = '';
  isTotpActive: boolean = false;

  // 🌟 NEW: Track if the logged-in user is from an external directory (LDAP)
  isCurrentUserExternal: boolean = false;

  constructor(
    private workspaceService: WorkspaceService,
    private roleLookupService: RoleLookupService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.resolveIdentityAndRoster();
  }

 resolveIdentityAndRoster(): void {
    this.workspaceService.getCurrentUser().subscribe({
      next: (me: any) => {
        // 🟢 1. Synchronize the real username! 
        // This overwrites 'GOOGLE_USER' with your actual Gmail address so the rest of the app works flawlessly.
        sessionStorage.setItem('X-IAM-USER', me.username);

        this.isAdmin = (me.userType === 'ADMIN');
        this.isTotpActive = me.totpEnabled === true;
        
        // 🟢 2. Safely capture the external identity flag directly from the source!
        // We check both naming conventions just in case Jackson JSON serialization dropped the 'is' prefix
        this.isCurrentUserExternal = (me.externalUser === true || me.isExternalUser === true);

        this.roleLookupService.setRole(me.userType);
        console.log(`[IAM SEC] Workspace verification context resolved. Is Admin: ${this.isAdmin} | External: ${this.isCurrentUserExternal}`);
        this.cdr.detectChanges();

        // Load the users after resolving identity
        this.loadUserRegistry();
      },
      error: (err: any) => {
        this.showFault('Session authorization context rejected or expired.');
        this.isAdmin = false;
        this.roleLookupService.clearRole();
        this.cdr.detectChanges();
      }
    });
  }

  loadUserRegistry(): void {
    this.workspaceService.getUsers().subscribe({
      next: (data: any[]) => {
        this.users = data;
        this.errorMessage = '';
        
        // 🟢 3. We removed the broken array search here because we already found the flag securely above!
        
        this.cdr.detectChanges();
      },
      error: (err: any) => this.showFault('Identity inventory metrics collection failed.')
    });
  }

  canModifyRecord(user: any): boolean {
    if (user.username === 'admin') {
      return false;
    }
    if (this.isAdmin) {
      return true;
    }
    return user.username === this.currentUsername;
  }

  onCommitForm(ngForm: any): void {
    if (ngForm.invalid) {
      this.showFault('Form constraints verification failed.');
      return;
    }
    const payload = { ...this.formModel };
    this.workspaceService.addUser(payload).subscribe({
      next: (res: string) => {
        this.loadUserRegistry();
        ngForm.resetForm({ userType: 'USER' });
        this.formModel.userType = 'USER';
        this.showSuccess('Identity record successfully saved.');
      },
      error: (err: any) => this.showFault('Action dropped: Privileges token invalid.')
    });
  }

  onStartEdit(user: any): void {
    this.editingUserId = user.id;
    this.editBuffer = { ...user };
    this.cdr.detectChanges();
  }

  onCancelEdit(): void {
    this.editingUserId = null;
    this.cdr.detectChanges();
  }

  onSaveEdit(): void {
    this.workspaceService.editUser(this.editBuffer).subscribe({
      next: (res: string) => {
        const index = this.users.findIndex((u: any) => u.id === this.editingUserId);
        if (index !== -1) this.users[index] = { ...this.editBuffer };
        this.editingUserId = null;
        this.showSuccess('Modifications committed successfully.');
        this.cdr.detectChanges();
      },
      error: (err: any) => this.showFault('Update sequence dropped.')
    });
  }

  onDeleteUser(userId: number): void {
    if (!confirm('Permanently wipe selected principal node?')) return;
    this.workspaceService.deleteUser(userId).subscribe({
      next: (res: string) => {
        this.users = this.users.filter((u: any) => u.id !== userId);
        this.showSuccess('Record deleted.');
        this.cdr.detectChanges();
      },
      error: (err: any) => this.showFault('Wipe tracking execution dropped.')
    });
  }

  onNavigateBack(): void {
    this.router.navigate(['/gateway']);
  }

  onLogoutSession(): void {
    sessionStorage.clear();
    this.roleLookupService.clearRole();
    this.router.navigate(['/login']);
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    this.errorMessage = '';
    this.cdr.detectChanges();
    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  private showFault(msg: string): void {
    this.errorMessage = `[ACCESS FAULT] :: ${msg}`;
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  onBlockUser(userId: number): void {
    if (!confirm('Confirm operation: Suspend selected standard user access?')) return;
    this.workspaceService.blockUser(userId).subscribe({
      next: (textConfirmation: string) => {
        this.loadUserRegistry();
        this.successMessage = 'User node successfully blocked.';
        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.showFault(err.error || 'Block tracking operation dropped by security rules.');
      }
    });
  }

  onUnblockUser(userId: number): void {
    if (!confirm('Confirm operation: Restore system access for this blocked standard user account?')) return;
    this.workspaceService.unblockUser(userId).subscribe({
      next: (textConfirmation: string) => {
        this.loadUserRegistry();
        this.successMessage = 'User node access restrictions cleared successfully.';
        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.showFault(err.error || 'Unblock action rejected by database verification rules.');
      }
    });
  }

  onPasswordChange() {
    const payload = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.workspaceService.changePassword(payload).subscribe({
      next: () => {
        this.successMessage = "CREDENTIAL_UPDATE_SUCCESS";
        this.errorMessage = "";
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.status === 403 ? "AUTH_MISMATCH_ERR" : "SYS_ERR";
        this.successMessage = "";
        this.cdr.detectChanges();
      }
    });
  }

  get isRootAdminUser(): boolean {
    return this.currentUsername === 'admin';
  }

  get currentUsername(): string {
    return sessionStorage.getItem('X-IAM-USER') || '';
  }

  onInitializeMfaSetup() {
    this.workspaceService.getMfaSetup().subscribe({
      next: (data) => {
        this.mfaSecret = data.secret;
        this.mfaConfigString = data.manualConfigString;
        this.qrCodeDataUrl = data.qrCodeDataUrl;
        this.successMessage = "MFA_SEED_GENERATION_SUCCESSFUL";
        this.errorMessage = "";
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = "MFA_PROVISIONING_FAILED";
        this.successMessage = "";
        this.cdr.detectChanges();
      }
    });
  }

  onCommitMfaVerification() {
    if (!this.mfaVerificationCode || this.mfaVerificationCode.length !== 6) {
      this.errorMessage = "INVALID_TOKEN_LENGTH_ERR";
      this.successMessage = "";
      return;
    }

    this.workspaceService.verifyMfa(this.mfaVerificationCode).subscribe({
      next: () => {
        alert("MULTI_FACTOR_ENFORCEMENT_ACTIVE. INITIAL ENROLLMENT SUCCESSFUL. PURGING ACTIVE SESSION CONTEXT.");
        sessionStorage.clear();
        this.roleLookupService.clearRole();
        this.mfaSecret = null;
        this.qrCodeDataUrl = null;
        this.mfaVerificationCode = '';
        this.isTotpActive = true;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = "INVALID_MFA_TOKEN_PIN_REJECTED";
        this.successMessage = "";
        this.cdr.detectChanges();
      }
    });
  }

  onAdminDisableMfa(username: string) {
    if (confirm(`Are you sure you want to forcefully revoke MFA for user: ${username}?`)) {
      this.workspaceService.adminDisableMfa(username).subscribe({
        next: () => {
          this.successMessage = `MFA_REVOKED_FOR_${username.toUpperCase()}`;
          this.errorMessage = "";

          if (username === this.currentUsername) {
            this.isTotpActive = false;
          }

          this.loadUserRegistry();
        },
        error: (err) => {
          this.errorMessage = err.error || "ACTION_FAILED";
          this.cdr.detectChanges();
        }
      });
    }
  }

  onAdminForcePassword(username: string, userId: number) {
    if (username === this.currentUsername) {
      this.errorMessage = "ACCESS_DENIED: PROCEED TO SELF-SERVICE POLICY CARD BELOW TO MODIFY YOUR ACTIVE ACCESS KEY";
      this.cdr.detectChanges();
      return;
    }

    const newPass = this.forcePasswordModel[userId];
    if (!newPass || newPass.length < 6) {
      this.errorMessage = "PASSWORD_MIN_LENGTH_6_REQUIRED";
      this.cdr.detectChanges();
      return;
    }

    this.workspaceService.adminForcePassword(username, newPass).subscribe({
      next: () => {
        this.successMessage = `PASSWORD_FORCED_FOR_${username.toUpperCase()}`;
        this.errorMessage = "";
        this.forcePasswordModel[userId] = '';
        this.loadUserRegistry();
      },
      error: (err) => {
        this.errorMessage = err.error || "ACTION_FAILED";
        this.cdr.detectChanges();
      }
    });
  }
}