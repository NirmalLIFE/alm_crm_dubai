import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmSpareInvoiceComponent } from './alm-spare-invoice.component';

describe('AlmSpareInvoiceComponent', () => {
  let component: AlmSpareInvoiceComponent;
  let fixture: ComponentFixture<AlmSpareInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmSpareInvoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmSpareInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
