import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPsfReportComponent } from './user-psf-report.component';

describe('UserPsfReportComponent', () => {
  let component: UserPsfReportComponent;
  let fixture: ComponentFixture<UserPsfReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserPsfReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPsfReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
