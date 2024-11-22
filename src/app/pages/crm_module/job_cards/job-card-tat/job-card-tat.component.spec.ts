import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobCardTatComponent } from './job-card-tat.component';

describe('JobCardTatComponent', () => {
  let component: JobCardTatComponent;
  let fixture: ComponentFixture<JobCardTatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobCardTatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobCardTatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
