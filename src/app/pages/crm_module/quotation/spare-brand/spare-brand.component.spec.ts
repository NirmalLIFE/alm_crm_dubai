import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpareBrandComponent } from './spare-brand.component';

describe('SpareBrandComponent', () => {
  let component: SpareBrandComponent;
  let fixture: ComponentFixture<SpareBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpareBrandComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpareBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
