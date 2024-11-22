import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InboundCallReportComponent } from './inbound-call-report.component';

describe('InboundCallReportComponent', () => {
  let component: InboundCallReportComponent;
  let fixture: ComponentFixture<InboundCallReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InboundCallReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InboundCallReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
