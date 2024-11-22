import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialMediaCampaignReportComponent } from './social-media-campaign-report.component';

describe('SocialMediaCampaignReportComponent', () => {
  let component: SocialMediaCampaignReportComponent;
  let fixture: ComponentFixture<SocialMediaCampaignReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocialMediaCampaignReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialMediaCampaignReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
