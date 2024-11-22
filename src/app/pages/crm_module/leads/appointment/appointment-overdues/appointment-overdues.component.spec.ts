import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentOverduesComponent } from './appointment-overdues.component';

describe('AppointmentOverduesComponent', () => {
  let component: AppointmentOverduesComponent;
  let fixture: ComponentFixture<AppointmentOverduesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentOverduesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentOverduesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
