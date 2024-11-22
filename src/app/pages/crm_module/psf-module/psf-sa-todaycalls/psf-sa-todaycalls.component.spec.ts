import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsfSaTodaycallsComponent } from './psf-sa-todaycalls.component';

describe('PsfSaTodaycallsComponent', () => {
  let component: PsfSaTodaycallsComponent;
  let fixture: ComponentFixture<PsfSaTodaycallsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PsfSaTodaycallsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsfSaTodaycallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
