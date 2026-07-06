import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayLanding } from './gateway-landing';

describe('GatewayLanding', () => {
  let component: GatewayLanding;
  let fixture: ComponentFixture<GatewayLanding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GatewayLanding],
    }).compileComponents();

    fixture = TestBed.createComponent(GatewayLanding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
