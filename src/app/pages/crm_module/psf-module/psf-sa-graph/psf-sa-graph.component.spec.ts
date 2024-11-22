import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsfSaGraphComponent } from './psf-sa-graph.component';

describe('PsfSaGraphComponent', () => {
  let component: PsfSaGraphComponent;
  let fixture: ComponentFixture<PsfSaGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PsfSaGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsfSaGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
