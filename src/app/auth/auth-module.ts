import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { LoginComponent } from './components/login/login.component';
import { GatewayLandingComponent } from './components/gateway-landing/gateway-landing';
import { ConsoleWorkspace } from './components/console-workspace/console-workspace';
import { LdapConfigComponent } from './components/ldap-config/ldap-config';
import { AaaWorkspaceComponent } from './components/aaa-workspace.component/aaa-workspace.component';
import { OidcConfigComponent } from './components/oidc-config/oidc-config';

@NgModule({
  declarations: [
    LoginComponent,
    GatewayLandingComponent,
    LdapConfigComponent,
    AaaWorkspaceComponent,
    OidcConfigComponent,
  ],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    HttpClientModule, 
    ConsoleWorkspace, 
    FormsModule,
    GoogleSigninButtonModule // 🌟 NEW: Add it to the imports array here!
  ],
  exports: [LoginComponent, GatewayLandingComponent, ConsoleWorkspace],
})
export class AuthModule {}