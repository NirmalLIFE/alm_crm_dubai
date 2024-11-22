import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmNmSpareInvoiceListComponent } from './alm-nm-spare-invoice-list.component';

describe('AlmNmSpareInvoiceListComponent', () => {
  let component: AlmNmSpareInvoiceListComponent;
  let fixture: ComponentFixture<AlmNmSpareInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmNmSpareInvoiceListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmNmSpareInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
