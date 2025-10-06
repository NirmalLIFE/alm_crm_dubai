import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadAnalysisComponent } from './lead-analysis.component';

describe('LeadAnalysisComponent', () => {
  let component: LeadAnalysisComponent;
  let fixture: ComponentFixture<LeadAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeadAnalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
