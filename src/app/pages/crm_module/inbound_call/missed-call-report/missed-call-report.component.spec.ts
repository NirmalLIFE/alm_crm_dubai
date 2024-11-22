import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissedCallReportComponent } from './missed-call-report.component';

describe('MissedCallReportComponent', () => {
  let component: MissedCallReportComponent;
  let fixture: ComponentFixture<MissedCallReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissedCallReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissedCallReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
