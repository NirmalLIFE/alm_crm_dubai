import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsfCallHistoryComponent } from './psf-call-history.component';

describe('PsfCallHistoryComponent', () => {
  let component: PsfCallHistoryComponent;
  let fixture: ComponentFixture<PsfCallHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PsfCallHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsfCallHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
