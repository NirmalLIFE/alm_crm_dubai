import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePackageRequestedComponent } from './service-package-requested.component';

describe('ServicePackageRequestedComponent', () => {
  let component: ServicePackageRequestedComponent;
  let fixture: ComponentFixture<ServicePackageRequestedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicePackageRequestedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePackageRequestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
