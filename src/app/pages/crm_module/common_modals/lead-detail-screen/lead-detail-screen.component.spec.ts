import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadDetailScreenComponent } from './lead-detail-screen.component';

describe('LeadDetailScreenComponent', () => {
  let component: LeadDetailScreenComponent;
  let fixture: ComponentFixture<LeadDetailScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeadDetailScreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadDetailScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
