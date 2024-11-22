import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DasboardMasterComponent } from './dasboard-master.component';

describe('DasboardMasterComponent', () => {
  let component: DasboardMasterComponent;
  let fixture: ComponentFixture<DasboardMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DasboardMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DasboardMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
