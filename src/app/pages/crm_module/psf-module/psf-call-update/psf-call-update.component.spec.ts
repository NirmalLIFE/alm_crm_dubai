import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsfCallUpdateComponent } from './psf-call-update.component';

describe('PsfCallUpdateComponent', () => {
  let component: PsfCallUpdateComponent;
  let fixture: ComponentFixture<PsfCallUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PsfCallUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsfCallUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
