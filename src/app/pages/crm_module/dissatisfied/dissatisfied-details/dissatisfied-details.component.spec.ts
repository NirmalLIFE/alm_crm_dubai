import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DissatisfiedDetailsComponent } from './dissatisfied-details.component';

describe('DissatisfiedDetailsComponent', () => {
  let component: DissatisfiedDetailsComponent;
  let fixture: ComponentFixture<DissatisfiedDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DissatisfiedDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DissatisfiedDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
