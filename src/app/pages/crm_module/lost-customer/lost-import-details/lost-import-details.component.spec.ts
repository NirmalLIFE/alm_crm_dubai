import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LostImportDetailsComponent } from './lost-import-details.component';

describe('LostImportDetailsComponent', () => {
  let component: LostImportDetailsComponent;
  let fixture: ComponentFixture<LostImportDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LostImportDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LostImportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
