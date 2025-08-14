import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePkgKmPriceMapComponent } from './service-pkg-km-price-map.component';

describe('ServicePkgKmPriceMapComponent', () => {
  let component: ServicePkgKmPriceMapComponent;
  let fixture: ComponentFixture<ServicePkgKmPriceMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicePkgKmPriceMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePkgKmPriceMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
