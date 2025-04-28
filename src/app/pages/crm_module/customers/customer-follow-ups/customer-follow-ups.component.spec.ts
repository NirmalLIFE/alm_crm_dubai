import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFollowUpsComponent } from './customer-follow-ups.component';

describe('CustomerFollowUpsComponent', () => {
  let component: CustomerFollowUpsComponent;
  let fixture: ComponentFixture<CustomerFollowUpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerFollowUpsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerFollowUpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
