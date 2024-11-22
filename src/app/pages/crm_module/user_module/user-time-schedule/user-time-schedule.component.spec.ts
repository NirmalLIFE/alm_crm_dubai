import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTimeScheduleComponent } from './user-time-schedule.component';

describe('UserTimeScheduleComponent', () => {
  let component: UserTimeScheduleComponent;
  let fixture: ComponentFixture<UserTimeScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserTimeScheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserTimeScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
