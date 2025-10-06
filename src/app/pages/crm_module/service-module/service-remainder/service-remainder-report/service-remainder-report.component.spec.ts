import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceRemainderReportComponent } from './service-remainder-report.component';

describe('ServiceRemainderReportComponent', () => {
  let component: ServiceRemainderReportComponent;
  let fixture: ComponentFixture<ServiceRemainderReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceRemainderReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceRemainderReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
