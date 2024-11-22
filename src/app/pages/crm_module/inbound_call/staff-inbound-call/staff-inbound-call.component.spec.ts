import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffInboundCallComponent } from './staff-inbound-call.component';

describe('StaffInboundCallComponent', () => {
  let component: StaffInboundCallComponent;
  let fixture: ComponentFixture<StaffInboundCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffInboundCallComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffInboundCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
