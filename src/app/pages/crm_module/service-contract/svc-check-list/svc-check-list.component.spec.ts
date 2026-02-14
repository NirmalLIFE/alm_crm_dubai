import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvcCheckListComponent } from './svc-check-list.component';

describe('SvcCheckListComponent', () => {
  let component: SvcCheckListComponent;
  let fixture: ComponentFixture<SvcCheckListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SvcCheckListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SvcCheckListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
