import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialMediaCampaignUpdateComponent } from './social-media-campaign-update.component';

describe('SocialMediaCampaignUpdateComponent', () => {
  let component: SocialMediaCampaignUpdateComponent;
  let fixture: ComponentFixture<SocialMediaCampaignUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocialMediaCampaignUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialMediaCampaignUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
