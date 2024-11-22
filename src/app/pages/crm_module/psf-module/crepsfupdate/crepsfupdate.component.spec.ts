import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrepsfupdateComponent } from './crepsfupdate.component';

describe('CrepsfupdateComponent', () => {
  let component: CrepsfupdateComponent;
  let fixture: ComponentFixture<CrepsfupdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrepsfupdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrepsfupdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
