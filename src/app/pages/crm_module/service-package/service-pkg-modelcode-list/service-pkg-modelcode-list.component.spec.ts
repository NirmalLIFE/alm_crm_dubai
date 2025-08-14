import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePkgModelcodeListComponent } from './service-pkg-modelcode-list.component';

describe('ServicePkgModelcodeListComponent', () => {
  let component: ServicePkgModelcodeListComponent;
  let fixture: ComponentFixture<ServicePkgModelcodeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicePkgModelcodeListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePkgModelcodeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
