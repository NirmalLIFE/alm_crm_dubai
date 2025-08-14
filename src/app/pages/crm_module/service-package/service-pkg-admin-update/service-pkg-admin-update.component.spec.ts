import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePkgAdminUpdateComponent } from './service-pkg-admin-update.component';

describe('ServicePkgAdminUpdateComponent', () => {
  let component: ServicePkgAdminUpdateComponent;
  let fixture: ComponentFixture<ServicePkgAdminUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicePkgAdminUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePkgAdminUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
