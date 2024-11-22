import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffMissedCallsComponent } from './staff-missed-calls.component';

describe('StaffMissedCallsComponent', () => {
  let component: StaffMissedCallsComponent;
  let fixture: ComponentFixture<StaffMissedCallsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffMissedCallsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffMissedCallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
