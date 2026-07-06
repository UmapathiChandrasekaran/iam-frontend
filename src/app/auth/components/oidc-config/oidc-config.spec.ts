import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OidcConfigComponent } from './oidc-config';

describe('OidcConfig', () => {
  let component: OidcConfigComponent;
  let fixture: ComponentFixture<OidcConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OidcConfigComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OidcConfigComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
