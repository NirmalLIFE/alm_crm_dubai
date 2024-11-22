import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedLostCountComponent } from './assigned-lost-count.component';

describe('AssignedLostCountComponent', () => {
  let component: AssignedLostCountComponent;
  let fixture: ComponentFixture<AssignedLostCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignedLostCountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedLostCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
