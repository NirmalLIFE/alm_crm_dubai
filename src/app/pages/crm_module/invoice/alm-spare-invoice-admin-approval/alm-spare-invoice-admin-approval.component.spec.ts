import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmSpareInvoiceAdminApprovalComponent } from './alm-spare-invoice-admin-approval.component';

describe('AlmSpareInvoiceAdminApprovalComponent', () => {
  let component: AlmSpareInvoiceAdminApprovalComponent;
  let fixture: ComponentFixture<AlmSpareInvoiceAdminApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmSpareInvoiceAdminApprovalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmSpareInvoiceAdminApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
