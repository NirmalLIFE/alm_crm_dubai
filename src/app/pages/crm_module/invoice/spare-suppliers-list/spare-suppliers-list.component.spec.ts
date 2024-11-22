import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpareSuppliersListComponent } from './spare-suppliers-list.component';

describe('SpareSuppliersListComponent', () => {
  let component: SpareSuppliersListComponent;
  let fixture: ComponentFixture<SpareSuppliersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpareSuppliersListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpareSuppliersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
