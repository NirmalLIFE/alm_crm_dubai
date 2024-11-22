import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredanddissatisfiedComponent } from './expiredanddissatisfied.component';

describe('ExpiredanddissatisfiedComponent', () => {
  let component: ExpiredanddissatisfiedComponent;
  let fixture: ComponentFixture<ExpiredanddissatisfiedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpiredanddissatisfiedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiredanddissatisfiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
