import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePkgMcLabourSetupComponent } from './service-pkg-mc-labour-setup.component';

describe('ServicePkgMcLabourSetupComponent', () => {
  let component: ServicePkgMcLabourSetupComponent;
  let fixture: ComponentFixture<ServicePkgMcLabourSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicePkgMcLabourSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePkgMcLabourSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
