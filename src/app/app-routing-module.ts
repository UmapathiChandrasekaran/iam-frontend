import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { GatewayLandingComponent } from './auth/components/gateway-landing/gateway-landing';
import { ConsoleWorkspace } from './auth/components/console-workspace/console-workspace';
import { Dashboard } from './dashboard/dashboard';
import { AaaWorkspaceComponent } from './auth/components/aaa-workspace.component/aaa-workspace.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  { path: 'gateway', component: GatewayLandingComponent },

  { path: 'workspace', component: ConsoleWorkspace },

  { path: 'dashboard', component: Dashboard },

  { path: 'aaa-workspace', component: AaaWorkspaceComponent, },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
