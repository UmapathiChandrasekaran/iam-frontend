import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AuthModule } from './auth/auth-module';
import { Dashboard } from './dashboard/dashboard';
import { HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { AuthInterceptor } from './auth/interceptors/auth-interceptor-interceptor';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
@NgModule({
  declarations: [App, Dashboard],
  
  imports: [
    BrowserModule, 
    AppRoutingModule, 
    AuthModule, 
    FormsModule, 
    ReactiveFormsModule, 
    SocialLoginModule,
    GoogleSigninButtonModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(), 
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
           id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '303878158073-l8ru2s2d3acia5fstsoj0ibva1nl4s50.apps.googleusercontent.com',
              {
                oneTapEnabled: false, // <-- Kills the broken auto-popup
                prompt: 'consent'     // <-- Forces the secure popup ONLY on button click
              }// <-- PASTE YOUR COPIED CLIENT ID HERE
            )
          }
        ],
        onError: (err) => {
          console.error('[OIDC INIT ERROR]', err);
        }
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [App],
})
export class AppModule {}