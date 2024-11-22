import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobStatusMasterComponent } from './job-status-master.component';

describe('JobStatusMasterComponent', () => {
  let component: JobStatusMasterComponent;
  let fixture: ComponentFixture<JobStatusMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobStatusMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobStatusMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
