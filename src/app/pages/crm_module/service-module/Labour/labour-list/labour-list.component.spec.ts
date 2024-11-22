import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabourListComponent } from './labour-list.component';

describe('LabourListComponent', () => {
  let component: LabourListComponent;
  let fixture: ComponentFixture<LabourListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabourListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabourListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
