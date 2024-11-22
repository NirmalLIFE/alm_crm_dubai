import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpareDashComponent } from './spare-dash.component';

describe('SpareDashComponent', () => {
  let component: SpareDashComponent;
  let fixture: ComponentFixture<SpareDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpareDashComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpareDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
