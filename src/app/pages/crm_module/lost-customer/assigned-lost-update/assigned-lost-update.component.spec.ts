import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedLostUpdateComponent } from './assigned-lost-update.component';

describe('AssignedLostUpdateComponent', () => {
  let component: AssignedLostUpdateComponent;
  let fixture: ComponentFixture<AssignedLostUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignedLostUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedLostUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
