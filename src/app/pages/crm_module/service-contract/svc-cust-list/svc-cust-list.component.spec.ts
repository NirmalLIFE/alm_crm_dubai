import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvcCustListComponent } from './svc-cust-list.component';

describe('SvcCustListComponent', () => {
  let component: SvcCustListComponent;
  let fixture: ComponentFixture<SvcCustListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SvcCustListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SvcCustListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
