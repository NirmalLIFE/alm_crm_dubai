import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsfSaModalComponent } from './psf-sa-modal.component';

describe('PsfSaModalComponent', () => {
  let component: PsfSaModalComponent;
  let fixture: ComponentFixture<PsfSaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PsfSaModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsfSaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
