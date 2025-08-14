import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePackageListComponent } from './service-package-list.component';

describe('ServicePackageListComponent', () => {
  let component: ServicePackageListComponent;
  let fixture: ComponentFixture<ServicePackageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicePackageListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePackageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
