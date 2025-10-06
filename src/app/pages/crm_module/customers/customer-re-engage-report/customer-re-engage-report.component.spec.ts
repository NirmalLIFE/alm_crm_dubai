import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerReEngageReportComponent } from './customer-re-engage-report.component';

describe('CustomerReEngageReportComponent', () => {
  let component: CustomerReEngageReportComponent;
  let fixture: ComponentFixture<CustomerReEngageReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerReEngageReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerReEngageReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
