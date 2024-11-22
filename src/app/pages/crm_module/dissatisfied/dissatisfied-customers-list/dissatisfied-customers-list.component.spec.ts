import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DissatisfiedCustomersListComponent } from './dissatisfied-customers-list.component';

describe('DissatisfiedCustomersListComponent', () => {
  let component: DissatisfiedCustomersListComponent;
  let fixture: ComponentFixture<DissatisfiedCustomersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DissatisfiedCustomersListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DissatisfiedCustomersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
