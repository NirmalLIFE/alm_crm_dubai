import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallLogAddScreenComponent } from './call-log-add-screen.component';

describe('CallLogAddScreenComponent', () => {
  let component: CallLogAddScreenComponent;
  let fixture: ComponentFixture<CallLogAddScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallLogAddScreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallLogAddScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
