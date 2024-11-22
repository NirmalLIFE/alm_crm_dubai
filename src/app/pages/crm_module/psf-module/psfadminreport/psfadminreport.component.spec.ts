import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsfadminreportComponent } from './psfadminreport.component';

describe('PsfadminreportComponent', () => {
  let component: PsfadminreportComponent;
  let fixture: ComponentFixture<PsfadminreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PsfadminreportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsfadminreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
