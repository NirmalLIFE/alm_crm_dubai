import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallLogDetailComponent } from './call-log-detail.component';

describe('CallLogDetailComponent', () => {
  let component: CallLogDetailComponent;
  let fixture: ComponentFixture<CallLogDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallLogDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallLogDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
