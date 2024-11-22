import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignTimeExceededComponent } from './campaign-time-exceeded.component';

describe('CampaignTimeExceededComponent', () => {
  let component: CampaignTimeExceededComponent;
  let fixture: ComponentFixture<CampaignTimeExceededComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CampaignTimeExceededComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignTimeExceededComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
