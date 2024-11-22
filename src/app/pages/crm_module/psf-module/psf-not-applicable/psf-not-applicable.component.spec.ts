import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsfNotApplicableComponent } from './psf-not-applicable.component';

describe('PsfNotApplicableComponent', () => {
  let component: PsfNotApplicableComponent;
  let fixture: ComponentFixture<PsfNotApplicableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PsfNotApplicableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsfNotApplicableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
