import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartsLogComponent } from './parts-log.component';

describe('PartsLogComponent', () => {
  let component: PartsLogComponent;
  let fixture: ComponentFixture<PartsLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartsLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartsLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
