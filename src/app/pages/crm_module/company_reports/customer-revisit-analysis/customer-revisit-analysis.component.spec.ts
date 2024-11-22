import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerRevisitAnalysisComponent } from './customer-revisit-analysis.component';

describe('CustomerRevisitAnalysisComponent', () => {
  let component: CustomerRevisitAnalysisComponent;
  let fixture: ComponentFixture<CustomerRevisitAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerRevisitAnalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerRevisitAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
