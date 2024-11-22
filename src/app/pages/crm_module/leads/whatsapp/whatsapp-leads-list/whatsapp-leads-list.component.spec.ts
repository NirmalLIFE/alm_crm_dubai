import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappLeadsListComponent } from './whatsapp-leads-list.component';

describe('WhatsappLeadsListComponent', () => {
  let component: WhatsappLeadsListComponent;
  let fixture: ComponentFixture<WhatsappLeadsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhatsappLeadsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappLeadsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
