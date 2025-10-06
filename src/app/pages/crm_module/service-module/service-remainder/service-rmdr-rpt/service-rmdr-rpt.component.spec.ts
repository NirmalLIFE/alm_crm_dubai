import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceRmdrRptComponent } from './service-rmdr-rpt.component';

describe('ServiceRmdrRptComponent', () => {
  let component: ServiceRmdrRptComponent;
  let fixture: ComponentFixture<ServiceRmdrRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceRmdrRptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceRmdrRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
