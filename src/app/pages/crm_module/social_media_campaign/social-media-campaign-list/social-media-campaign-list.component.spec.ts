import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialMediaCampaignListComponent } from './social-media-campaign-list.component';

describe('SocialMediaCampaignListComponent', () => {
  let component: SocialMediaCampaignListComponent;
  let fixture: ComponentFixture<SocialMediaCampaignListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocialMediaCampaignListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialMediaCampaignListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
