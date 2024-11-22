import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserpsflistingComponent } from './userpsflisting.component';

describe('UserpsflistingComponent', () => {
  let component: UserpsflistingComponent;
  let fixture: ComponentFixture<UserpsflistingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserpsflistingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserpsflistingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
