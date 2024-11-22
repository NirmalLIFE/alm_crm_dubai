import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallPurposeListComponent } from './call-purpose-list.component';

describe('CallPurposeListComponent', () => {
  let component: CallPurposeListComponent;
  let fixture: ComponentFixture<CallPurposeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallPurposeListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallPurposeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
