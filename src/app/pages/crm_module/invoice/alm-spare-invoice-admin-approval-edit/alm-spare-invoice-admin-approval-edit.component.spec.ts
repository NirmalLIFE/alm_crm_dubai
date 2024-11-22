import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmSpareInvoiceAdminApprovalEditComponent } from './alm-spare-invoice-admin-approval-edit.component';

describe('AlmSpareInvoiceAdminApprovalEditComponent', () => {
  let component: AlmSpareInvoiceAdminApprovalEditComponent;
  let fixture: ComponentFixture<AlmSpareInvoiceAdminApprovalEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmSpareInvoiceAdminApprovalEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmSpareInvoiceAdminApprovalEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
