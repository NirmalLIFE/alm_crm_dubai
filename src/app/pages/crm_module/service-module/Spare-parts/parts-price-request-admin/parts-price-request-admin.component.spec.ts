import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartsPriceRequestAdminComponent } from './parts-price-request-admin.component';

describe('PartsPriceRequestAdminComponent', () => {
  let component: PartsPriceRequestAdminComponent;
  let fixture: ComponentFixture<PartsPriceRequestAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartsPriceRequestAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartsPriceRequestAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
