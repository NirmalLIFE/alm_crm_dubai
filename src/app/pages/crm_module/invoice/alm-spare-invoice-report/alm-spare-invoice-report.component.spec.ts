import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmSpareInvoiceReportComponent } from './alm-spare-invoice-report.component';

describe('AlmSpareInvoiceReportComponent', () => {
  let component: AlmSpareInvoiceReportComponent;
  let fixture: ComponentFixture<AlmSpareInvoiceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmSpareInvoiceReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmSpareInvoiceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
