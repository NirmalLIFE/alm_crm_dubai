import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappLeadCreateComponent } from './whatsapp-lead-create.component';

describe('WhatsappLeadCreateComponent', () => {
  let component: WhatsappLeadCreateComponent;
  let fixture: ComponentFixture<WhatsappLeadCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhatsappLeadCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappLeadCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
