import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsfWhatsappReportComponent } from './psf-whatsapp-report.component';

describe('PsfWhatsappReportComponent', () => {
  let component: PsfWhatsappReportComponent;
  let fixture: ComponentFixture<PsfWhatsappReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PsfWhatsappReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsfWhatsappReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
