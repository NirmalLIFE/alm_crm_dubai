import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallAnalysisReportComponent } from './call-analysis-report.component';

describe('CallAnalysisReportComponent', () => {
  let component: CallAnalysisReportComponent;
  let fixture: ComponentFixture<CallAnalysisReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallAnalysisReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallAnalysisReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
