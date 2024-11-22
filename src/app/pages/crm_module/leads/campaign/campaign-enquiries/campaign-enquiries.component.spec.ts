import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignEnquiriesComponent } from './campaign-enquiries.component';

describe('CampaignEnquiriesComponent', () => {
  let component: CampaignEnquiriesComponent;
  let fixture: ComponentFixture<CampaignEnquiriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CampaignEnquiriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignEnquiriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
