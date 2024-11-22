import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobStatusUpdateComponent } from './job-status-update.component';

describe('JobStatusUpdateComponent', () => {
  let component: JobStatusUpdateComponent;
  let fixture: ComponentFixture<JobStatusUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobStatusUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobStatusUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
