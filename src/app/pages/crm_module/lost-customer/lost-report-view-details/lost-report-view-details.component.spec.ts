import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LostReportViewDetailsComponent } from './lost-report-view-details.component';

describe('LostReportViewDetailsComponent', () => {
  let component: LostReportViewDetailsComponent;
  let fixture: ComponentFixture<LostReportViewDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LostReportViewDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LostReportViewDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
