import { TestBed } from '@angular/core/testing';

import { LdapConfigService } from './ldap-config.service';

describe('LdapConfigService', () => {
  let service: LdapConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LdapConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
