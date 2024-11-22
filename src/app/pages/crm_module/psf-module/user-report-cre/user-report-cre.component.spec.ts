import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReportCreComponent } from './user-report-cre.component';

describe('UserReportCreComponent', () => {
  let component: UserReportCreComponent;
  let fixture: ComponentFixture<UserReportCreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserReportCreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserReportCreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
