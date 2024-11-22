import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InboundCallAnalysisComponent } from './inbound-call-analysis.component';

describe('InboundCallAnalysisComponent', () => {
  let component: InboundCallAnalysisComponent;
  let fixture: ComponentFixture<InboundCallAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InboundCallAnalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InboundCallAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
