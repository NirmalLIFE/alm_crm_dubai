import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrepsflistingComponent } from './crepsflisting.component';

describe('CrepsflistingComponent', () => {
  let component: CrepsflistingComponent;
  let fixture: ComponentFixture<CrepsflistingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrepsflistingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrepsflistingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
