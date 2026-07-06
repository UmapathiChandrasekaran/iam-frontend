import { Component, OnInit, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { RoleLookupService } from '../../services/role.lookup.service';
import { WorkspaceService } from '../../services/workspace.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Router, ActivatedRoute } from '@angular/router'; // Make sure ActivatedRoute is here!
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {

  private apiUrl = environment.authApiUrl;
  loginForm!: FormGroup;
  errorMessage: string | null = null;

  isLoading: boolean = false;
  isSuccessBlinking: boolean = false; // Triggers the stable 3-pulse sequence
  isSuccess: boolean = false;         // Triggers the final full screen blast wave
  isError: boolean = false;

  isPasswordFocused = false;
  isUsernameFocused = false;
  oidcEnabled: boolean = false;
  showSsoTab: boolean = false;

  isRedEyed: boolean = false; //  Add this line to track error eye colors

  // STAGE-2 MULTI-FACTOR AUTHENTICATION STATE TRACKERS
  isMfaPromptRequired: boolean = false;
  challengeUsername: string = '';
  loginOtpCode: string = '';

  eyeX = 0;
  eyeY = 0;
  private readonly EYE_LIMIT = 9;
  private readonly SENSITIVITY = 4.5;
  stars: any[] = [];
  clouds: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private workspaceService: WorkspaceService,
    private roleLookupService: RoleLookupService,
    private socialAuthService: SocialAuthService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.generateStars(200);
    this.generateClouds(40);

    // 🌟 THE FIX: Added && user.email to satisfy TypeScript Strict Mode
    this.socialAuthService.authState.subscribe((user) => {
      if (user && user.idToken && user.email) {
        console.log('[OIDC FEDERATION] Intercepted Identity Token for:', user.email);
        this.executeFederatedLogin(user.email, user.idToken);
      }
    });

    this.http.get<any>(this.apiUrl+'/api/public/oidc/status').subscribe({
      next: (res) => this.oidcEnabled = res.enabled,
      error: () => this.oidcEnabled = false
    });

    this.route.queryParams.subscribe(params => {
      const tokenFromUrl = params['token'];
      const errorFromUrl = params['error']; // Catch the error parameter
      
      if (tokenFromUrl) {
        // ... your existing token login logic ...
        this.authService.setSession('GOOGLE_USER', tokenFromUrl);
        this.ngZone.run(() => {
          this.router.navigate(['/gateway']);
        });
      }

      // DISPLAY THE BLOCKED ACCOUNT MESSAGE
      if (errorFromUrl === 'ACCOUNT_BLOCKED') {
        this.errorMessage = 'ACCESS DENIED: ACCOUNT SUSPENDED. CONTACT ADMIN.';
        this.triggerErrorShake(); // Triggers your red eye animation!
      } else if (errorFromUrl) {
        this.errorMessage = 'EXTERNAL AUTHENTICATION REJECTED.';
        this.triggerErrorShake();
      }
    });
  }

  executeFederatedLogin(email: string, jwtToken: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Notice we hit the exact same backend endpoint!
    this.http.post(this.apiUrl+'/api/login', {
      username: email,
      password: jwtToken // Sending the massive 1000+ char JWT as the password!
    }, { observe: 'response' }).subscribe({
      next: (response) => {
        const sessionToken = response.headers.get('X-IAM-SESSION-ID');
        if (sessionToken) {
          sessionStorage.setItem('X-IAM-SESSION-ID', sessionToken);
          // Route to gateway...
          window.location.href = '/gateway';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = '[ FEDERATION REJECTED ]: Invalid cryptographic signature or unauthorized account.';
      }
    });
  }

  onCardBlur(event: FocusEvent): void {
    const card = document.querySelector('.login-card');
    const relatedTarget = event.relatedTarget as HTMLElement;

    if (card && !card.contains(relatedTarget)) {
      if (this.loginForm.valid && !this.isLoading) {
        this.onSubmit();
      }
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isPasswordFocused) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (event.clientX - cx) / cx;
    const dy = (event.clientY - cy) / cy;

    this.eyeX = Math.max(-this.EYE_LIMIT, Math.min(this.EYE_LIMIT, dx * this.EYE_LIMIT * this.SENSITIVITY));
    this.eyeY = Math.max(-this.EYE_LIMIT, Math.min(this.EYE_LIMIT, dy * this.EYE_LIMIT * this.SENSITIVITY));
  }

  /**
   * STAGE 1: Credential Authentication Call
   */
  onSubmit(): void {
    this.isPasswordFocused = false;
    this.isUsernameFocused = false;

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter both username and password.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.isError = false;
    this.cdr.detectChanges(); // Render ambient energy charge loop instantly

    // Cinematic delay before sending data to the authentication endpoint
    setTimeout(() => {
      this.http.post(this.apiUrl+'/api/login', this.loginForm.value, {
        observe: 'response',
        responseType: 'text',
      })
        .subscribe({
          next: (response: HttpResponse<any>) => {
            // Parse network package data securely out of explicit text layouts
            let parsedBody: any = {};
            try {
              parsedBody = JSON.parse(response.body);
            } catch (e) {
              parsedBody = {};
            }

            // INTERCEPTION CHECK: If backend says MFA required, mutate the form view right away
            if (parsedBody && parsedBody.mfaRequired) {
              this.isLoading = false;
              this.isMfaPromptRequired = true;
              this.challengeUsername = parsedBody.username;
              this.errorMessage = null;
              this.isError = false;
              this.cdr.detectChanges(); // Sync layout states instantly
            } else {
              // Standard client continuity profile pathing
              this.isLoading = false;
              this.isSuccessBlinking = true;
              this.cdr.detectChanges(); // Direct paint command for the 3-pulse glow framework

              // Wait exactly 600ms for the 3 visual blinks to finish spinning
              setTimeout(() => {
                this.isSuccessBlinking = false;
                this.isSuccess = true;
                this.cdr.detectChanges(); // Fire the mouth plasma blast wave instantly

                setTimeout(() => {
                  const token = response.headers.get('X-IAM-SESSION-ID');
                  if (token) sessionStorage.setItem('X-IAM-SESSION-ID', token);
                  sessionStorage.setItem('X-IAM-USER', this.loginForm.get('username')?.value || 'Operator');
                  this.cdr.detectChanges();

                  console.log('[IAM AUTH] Credentials verified & token written. Triggering role lookup...');

                  // NEW ROLE RESOLUTION LAYER: Fetches permission context parameters right after login over HTTP
                  this.workspaceService.getCurrentUser().subscribe({
                    next: (me: any) => {
                      const extractedRole = me.userType; // Read 'ADMIN' or 'USER' straight out of database user payload

                      // RAM MATRIX SYNC: Broadcasts permissions to the screen view without saving it to storage!
                      this.roleLookupService.setRole(extractedRole);
                      console.log(`[IAM SYSTEM] Dynamic database resolution success. Active role: ${extractedRole}`);

                      this.cdr.detectChanges();
                      this.router.navigate(['/gateway']); // Navigate path parameters cleanly
                    },
                    error: (err: any) => {
                      console.error('[IAM SYSTEM] Context error encountered during login background lookup, falling back to standard limits.', err);
                      this.roleLookupService.setRole('USER'); // Safe default layout gate
                      this.cdr.detectChanges();
                      this.router.navigate(['/gateway']);
                    }
                  });

                }, 500);
              }, 600);
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.isSuccess = false;
            this.isSuccessBlinking = false;

            //  Explicitly handle the 403 Forbidden / Blocked Status
            if (err.status === 401) {
              this.errorMessage = 'Invalid credentials.';
            } else if (err.status === 403) {
              this.errorMessage = 'ACCESS DENIED: ACCOUNT SUSPENDED. CONTACT ADMIN.';
            } else {
              this.errorMessage = 'Connection failed.';
            }

            this.triggerErrorShake();
          },
        });
    }, 1200);
  }

  /**
   * STAGE 2: Time-Based OTP Handshake Verification Gate
   */
  onVerifyMfaLoginPin(): void {
    if (!this.loginOtpCode || this.loginOtpCode.length !== 6) {
      this.errorMessage = 'MFA code verification parameter must be exactly 6 digits.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.isError = false;
    this.cdr.detectChanges();

    this.http.post(this.apiUrl+'/api/login/mfa-verify', {
      username: this.challengeUsername,
      code: this.loginOtpCode
    }, {
      observe: 'response',
      responseType: 'text'
    }).subscribe({
      next: (response: HttpResponse<any>) => {
        // Clear previous state and run the cinematic success animations for the MFA user now
        this.isLoading = false;
        this.isSuccessBlinking = true;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.isSuccessBlinking = false;
          this.isSuccess = true;
          this.cdr.detectChanges();

          setTimeout(() => {
            // Extract and commit the verified operational session token safely
            const token = response.headers.get('X-IAM-SESSION-ID');
            if (token) sessionStorage.setItem('X-IAM-SESSION-ID', token);
            sessionStorage.setItem('X-IAM-USER', this.challengeUsername);
            this.cdr.detectChanges();

            console.log('[IAM AUTH] MFA dynamic validation pass completed. Synchronizing role mappings...');

            this.workspaceService.getCurrentUser().subscribe({
              next: (me: any) => {
                const extractedRole = me.userType;
                this.roleLookupService.setRole(extractedRole);
                this.cdr.detectChanges();
                this.router.navigate(['/gateway']);
              },
              error: (err: any) => {
                this.roleLookupService.setRole('USER');
                this.cdr.detectChanges();
                this.router.navigate(['/gateway']);
              }
            });
          }, 500);
        }, 600);
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.isSuccessBlinking = false;
        this.errorMessage = (err.status === 401) ? 'Invalid MFA token code signature.' : 'Handshake dropped.';
        this.triggerErrorShake();
      }
    });
  }

  triggerErrorShake(): void {
    this.isError = true;
    this.isRedEyed = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.isError = false;
      this.cdr.detectChanges();
    }, 400);
  }

  generateClouds(count: number): void {
    this.clouds = [];
    const baseCount = Math.floor(count * 0.4);
    for (let i = 0; i <= baseCount; i++) {
      const left = (i / baseCount) * 120 - 10;
      this.clouds.push({
        left: left + '%',
        bottom: (Math.random() * 8 - 22) + 'vh',
        width: (Math.random() * 20 + 45) + 'vw',
        height: (Math.random() * 15 + 35) + 'vh',
        delay: '-' + (Math.random() * 25) + 's'
      });
    }
  }

  generateStars(count: number): void {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        top: (Math.random() * 100) + 'vh',
        left: (Math.random() * 100) + 'vw',
        size: (Math.random() * 2 + 1) + 'px',
        delay: (Math.random() * 4) + 's',
        duration: (Math.random() * 4 + 2) + 's'
      });
    }
  }

  onUsernameBlur(): void { this.isUsernameFocused = false; this.eyeX = 0; this.eyeY = 0; }
  onPasswordBlur(): void { this.isPasswordFocused = false; }
  get currentUsername(): string { return this.loginForm.get('username')?.value; }

  onUsernameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isRedEyed = false; // Clears red eyes on type

    const len = input.value.length;
    this.eyeX = Math.max(-this.EYE_LIMIT, Math.min(this.EYE_LIMIT, (len * 0.8) - (this.EYE_LIMIT - 2)));
    this.eyeY = 5;
  }

  onUsernameFocus(): void {
    this.isUsernameFocused = true;
    this.isRedEyed = false; //Clears red eyes on focus
    this.eyeY = 6;
  }

  onPasswordFocus(): void {
    this.isPasswordFocused = true;
    this.isRedEyed = false; // Clears red eyes on focus
    this.eyeX = 0;
    this.eyeY = 0;
  }

  toggleSsoTab(): void {
    this.showSsoTab = !this.showSsoTab;
  }

  onSocialLoginClick(): void {
    this.http.get<{url: string}>(this.apiUrl+'/api/public/oidc/login-url').subscribe({
      next: (response) => window.location.href = response.url,
      error: (err) => console.error('OIDC Login failed to initialize', err)
    });
  }
}