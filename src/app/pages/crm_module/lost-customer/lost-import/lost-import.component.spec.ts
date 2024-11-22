import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LostImportComponent } from './lost-import.component';

describe('LostImportComponent', () => {
  let component: LostImportComponent;
  let fixture: ComponentFixture<LostImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LostImportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LostImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
