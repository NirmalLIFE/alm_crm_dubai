import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LostReportDetailsComponent } from './lost-report-details.component';

describe('LostReportDetailsComponent', () => {
  let component: LostReportDetailsComponent;
  let fixture: ComponentFixture<LostReportDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LostReportDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LostReportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
