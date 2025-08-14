import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePkgCnsLbrComponent } from './service-pkg-cns-lbr.component';

describe('ServicePkgCnsLbrComponent', () => {
  let component: ServicePkgCnsLbrComponent;
  let fixture: ComponentFixture<ServicePkgCnsLbrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicePkgCnsLbrComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePkgCnsLbrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
