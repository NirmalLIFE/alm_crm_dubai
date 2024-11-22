import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmSpareInvoiceListComponent } from './alm-spare-invoice-list.component';

describe('AlmSpareInvoiceListComponent', () => {
  let component: AlmSpareInvoiceListComponent;
  let fixture: ComponentFixture<AlmSpareInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmSpareInvoiceListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmSpareInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
