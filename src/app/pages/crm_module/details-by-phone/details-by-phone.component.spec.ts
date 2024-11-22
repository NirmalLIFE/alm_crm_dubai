import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsByPhoneComponent } from './details-by-phone.component';

describe('DetailsByPhoneComponent', () => {
  let component: DetailsByPhoneComponent;
  let fixture: ComponentFixture<DetailsByPhoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsByPhoneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsByPhoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
