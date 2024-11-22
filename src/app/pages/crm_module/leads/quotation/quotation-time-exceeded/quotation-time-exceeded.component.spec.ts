import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationTimeExceededComponent } from './quotation-time-exceeded.component';

describe('QuotationTimeExceededComponent', () => {
  let component: QuotationTimeExceededComponent;
  let fixture: ComponentFixture<QuotationTimeExceededComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuotationTimeExceededComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationTimeExceededComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
