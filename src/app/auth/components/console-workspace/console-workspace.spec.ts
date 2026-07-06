import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleWorkspace } from './console-workspace';

describe('ConsoleWorkspace', () => {
  let component: ConsoleWorkspace;
  let fixture: ComponentFixture<ConsoleWorkspace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsoleWorkspace],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsoleWorkspace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
