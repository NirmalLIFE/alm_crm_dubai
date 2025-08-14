import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePkgPartsSetupComponent } from './service-pkg-parts-setup.component';

describe('ServicePkgPartsSetupComponent', () => {
  let component: ServicePkgPartsSetupComponent;
  let fixture: ComponentFixture<ServicePkgPartsSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicePkgPartsSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePkgPartsSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
