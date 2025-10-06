import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCustomerDashComponent } from './new-customer-dash.component';

describe('NewCustomerDashComponent', () => {
  let component: NewCustomerDashComponent;
  let fixture: ComponentFixture<NewCustomerDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewCustomerDashComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCustomerDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
