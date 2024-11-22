import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffPerfomanceAnalysisComponent } from './staff-perfomance-analysis.component';

describe('StaffPerfomanceAnalysisComponent', () => {
  let component: StaffPerfomanceAnalysisComponent;
  let fixture: ComponentFixture<StaffPerfomanceAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffPerfomanceAnalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffPerfomanceAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
