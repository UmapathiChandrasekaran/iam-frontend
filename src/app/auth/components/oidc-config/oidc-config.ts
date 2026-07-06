import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🟢 Added ChangeDetectorRef
import { FormBuilder, FormGroup } from '@angular/forms';
import { OidcConfigService } from '../../services/oidc-config';

@Component({
  selector: 'app-oidc-config',
  templateUrl: './oidc-config.html',
  standalone: false
})
export class OidcConfigComponent implements OnInit {
  oidcForm: FormGroup;
  isLoading = false;
  statusMessage = '';
  isError = false;

  constructor(
    private fb: FormBuilder, 
    private oidcConfigService: OidcConfigService,
    private cdr: ChangeDetectorRef // 🟢 Injecting Change Detector
  ) {
    this.oidcForm = this.fb.group({
      oidcEnabled: [false],
      oidcClientId: [''],
      oidcClientSecret: [''],
      oidcIssuerUrl: ['']
    });
  }

  ngOnInit(): void {
    this.fetchConfig();
  }

  fetchConfig(): void {
    this.oidcConfigService.getConfig().subscribe({
      next: (config) => {
        if (config) {
          this.oidcForm.patchValue(config);
          this.cdr.detectChanges(); // 🟢 Force UI update
        }
      },
      error: (err) => console.error('Failed to fetch OIDC config:', err)
    });
  }

  saveConfig(): void {
    this.isLoading = true;
    this.statusMessage = '[ INITIATING SECURE OIDC PAYLOAD TRANSMISSION... ]';
    this.cdr.detectChanges(); // 🟢 Tell the UI to show the loading state instantly
    
    this.oidcConfigService.updateConfig(this.oidcForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.isError = false;
        this.statusMessage = '[ OIDC FEDERATION PARAMETERS SUCCESSFULLY COMMITTED ]';
        this.cdr.detectChanges(); // 🟢 Wake Angular up to remove the loading state
        
        setTimeout(() => {
          this.statusMessage = '';
          this.cdr.detectChanges(); // 🟢 Wake Angular up to hide the success message
        }, 3000);
      },
      error: (err) => {
        console.error('OIDC Save Error:', err);
        this.isLoading = false;
        this.isError = true;
        this.statusMessage = '[ CRITICAL ERROR: FAILED TO UPDATE OIDC CONFIGURATION ]';
        this.cdr.detectChanges(); // 🟢 Wake Angular up to show the error
      }
    });
  }

loadGoogleSandbox(): void {
    this.oidcForm.patchValue({
      oidcEnabled: true,
      oidcClientId: '',
      oidcClientSecret: '',
      oidcIssuerUrl: ''
    });
    this.saveConfig(); // Automatically commits to the database!
  }

}