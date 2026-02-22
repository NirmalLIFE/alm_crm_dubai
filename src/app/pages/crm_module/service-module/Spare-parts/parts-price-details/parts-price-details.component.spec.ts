import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartsPriceDetailsComponent } from './parts-price-details.component';

describe('PartsPriceDetailsComponent', () => {
  let component: PartsPriceDetailsComponent;
  let fixture: ComponentFixture<PartsPriceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartsPriceDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartsPriceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
