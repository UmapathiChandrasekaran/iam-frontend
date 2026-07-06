import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleLookupService } from './role.lookup.service'; // Points to the service in the same folder

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const roleLookup = inject(RoleLookupService);

  // 1. Check if a valid session token exists on the client machine
  const hasSessionToken = !!sessionStorage.getItem('X-IAM-SESSION-ID');
  
  // 2. Check if an active operating role has been selected from the gateway
  const hasSelectedRole = !!roleLookup.currentRole;

  console.log(`[IAM GUARD EVALUATION] Target URL: ${state.url} | Token Present: ${hasSessionToken} | Selected Role: ${roleLookup.currentRole || 'NONE'}`);

  // Scenario A: Completely unauthenticated user OR MFA step uncompleted.
  // Because our AuthController refuses to generate an X-IAM-SESSION-ID until the OTP matches,
  // any manual URL manipulation bypass attempt fails right here.
  if (!hasSessionToken) {
    console.warn(`[SECURITY INTERCEPT] Access denied on path: ${state.url}. Missing session token parameters. Routing to /login.`);
    return router.createUrlTree(['/login']);
  }

  // Scenario B: Authenticated via password and OTP, but has not picked an access lane role yet.
  // Forcibly hold them at the selection lobby until a lane is verified.
  if (hasSessionToken && !hasSelectedRole && state.url !== '/gateway') {
    console.info(`[LANE INTERCEPT] Missing operational role context for active session token. Forcing boundary check route back to /gateway.`);
    return router.createUrlTree(['/gateway']);
  }

  // Scenario C: Fully validated -> Allow the route navigation to resolve normally
  return true;
};