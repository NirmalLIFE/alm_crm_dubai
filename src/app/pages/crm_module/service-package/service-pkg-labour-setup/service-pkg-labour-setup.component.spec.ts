import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePkgLabourSetupComponent } from './service-pkg-labour-setup.component';

describe('ServicePkgLabourSetupComponent', () => {
  let component: ServicePkgLabourSetupComponent;
  let fixture: ComponentFixture<ServicePkgLabourSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicePkgLabourSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePkgLabourSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
