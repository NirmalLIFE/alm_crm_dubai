import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePkgPartsMasterComponent } from './service-pkg-parts-master.component';

describe('ServicePkgPartsMasterComponent', () => {
  let component: ServicePkgPartsMasterComponent;
  let fixture: ComponentFixture<ServicePkgPartsMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicePkgPartsMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePkgPartsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
