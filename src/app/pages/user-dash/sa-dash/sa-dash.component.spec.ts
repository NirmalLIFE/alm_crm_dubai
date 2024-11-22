import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaDashComponent } from './sa-dash.component';

describe('SaDashComponent', () => {
  let component: SaDashComponent;
  let fixture: ComponentFixture<SaDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaDashComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
