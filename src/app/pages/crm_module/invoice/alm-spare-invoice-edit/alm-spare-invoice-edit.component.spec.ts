import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmSpareInvoiceEditComponent } from './alm-spare-invoice-edit.component';

describe('AlmSpareInvoiceEditComponent', () => {
  let component: AlmSpareInvoiceEditComponent;
  let fixture: ComponentFixture<AlmSpareInvoiceEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmSpareInvoiceEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmSpareInvoiceEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
