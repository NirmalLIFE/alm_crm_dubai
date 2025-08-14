import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePkgKmSetupComponent } from './service-pkg-km-setup.component';

describe('ServicePkgKmSetupComponent', () => {
  let component: ServicePkgKmSetupComponent;
  let fixture: ComponentFixture<ServicePkgKmSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicePkgKmSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePkgKmSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
