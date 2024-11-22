import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerConversionReportComponent } from './customer-conversion-report.component';

describe('CustomerConversionReportComponent', () => {
  let component: CustomerConversionReportComponent;
  let fixture: ComponentFixture<CustomerConversionReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerConversionReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerConversionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
