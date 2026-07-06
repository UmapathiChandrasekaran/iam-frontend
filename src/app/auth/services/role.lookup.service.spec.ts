import { TestBed } from '@angular/core/testing';

import { RoleLookupService } from './role.lookup.service';

describe('RoleLookupService', () => {
  let service: RoleLookupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleLookupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
