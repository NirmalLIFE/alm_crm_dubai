import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreDashComponent } from './cre-dash.component';

describe('CreDashComponent', () => {
  let component: CreDashComponent;
  let fixture: ComponentFixture<CreDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreDashComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
