import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LostCountReportComponent } from './lost-count-report.component';

describe('LostCountReportComponent', () => {
  let component: LostCountReportComponent;
  let fixture: ComponentFixture<LostCountReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LostCountReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LostCountReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
