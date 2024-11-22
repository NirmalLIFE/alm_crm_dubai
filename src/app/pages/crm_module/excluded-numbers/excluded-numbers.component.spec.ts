import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcludedNumbersComponent } from './excluded-numbers.component';

describe('ExcludedNumbersComponent', () => {
  let component: ExcludedNumbersComponent;
  let fixture: ComponentFixture<ExcludedNumbersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcludedNumbersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcludedNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
