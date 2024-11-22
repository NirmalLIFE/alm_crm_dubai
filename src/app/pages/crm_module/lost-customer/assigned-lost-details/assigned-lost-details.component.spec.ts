import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedLostDetailsComponent } from './assigned-lost-details.component';

describe('AssignedLostDetailsComponent', () => {
  let component: AssignedLostDetailsComponent;
  let fixture: ComponentFixture<AssignedLostDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignedLostDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedLostDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
