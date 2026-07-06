import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LdapConfigService } from '../../services/ldap-config.service';

@Component({
  selector: 'app-ldap-config',
  standalone: false,
  templateUrl: './ldap-config.html',
  styleUrl: './ldap-config.css',
})
export class LdapConfigComponent implements OnInit {
  
  config: any = {
    ldapEnabled: false,
    ldapsSecureProtocol: false,
    ldapServerUrl: '',
    ldapBaseDn: '',
    ldapManagerDn: '',
    ldapManagerPassword: ''
  };

  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private ldapService: LdapConfigService,
    private cdr: ChangeDetectorRef // 🌟 INJECTED: Forces the UI to repaint
  ) {}

  ngOnInit(): void {
    this.fetchConfigurations();
  }

  fetchConfigurations(): void {
    this.ldapService.getConfigurations().subscribe({
      next: (data) => {
        console.log('[SYSTEM] Backend returned LDAP Data: ', data); 

        if (data) {
          Object.assign(this.config, data);
          this.cdr.detectChanges(); 
        }
      },
      error: () => {
        this.errorMessage = '[ SYSTEM ] Failed to fetch LDAP metrics from backend.';
        this.cdr.detectChanges();
      }
    });
  }

  // 🌟 NEW: Instantly injects the ForumSys Sandbox credentials
// 🌟 UPDATED: Loads defaults AND automatically triggers save
  onLoadSandboxDefaults(): void {
    this.config.ldapEnabled = true;
    this.config.ldapsSecureProtocol = false;
    this.config.ldapServerUrl = 'ldap://ldap.forumsys.com:389';
    this.config.ldapBaseDn = 'dc=example,dc=com';
    this.config.ldapManagerDn = 'cn=read-only-admin,dc=example,dc=com';
    this.config.ldapManagerPassword = 'password';
    
    this.cdr.detectChanges();

    this.onCommitChanges();
  }

  onCommitChanges(): void {
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    this.ldapService.saveConfigurations(this.config).subscribe({
      next: (updatedData) => {
        Object.assign(this.config, updatedData); // Safe merge
        
        this.successMessage = '[ OK ] DIRECTORY CONFIGURATIONS SAVED AND ACTIVE.';
        this.isSaving = false;
        this.cdr.detectChanges(); // Force repaint

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.errorMessage = '[ ERROR ] Database commitment rejected.';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }
}