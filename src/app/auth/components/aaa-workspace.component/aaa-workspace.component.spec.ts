import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AaaWorkspaceComponent } from './aaa-workspace.component';

describe('AaaWorkspaceComponent', () => {
  let component: AaaWorkspaceComponent;
  let fixture: ComponentFixture<AaaWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AaaWorkspaceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AaaWorkspaceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
