import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermittedIpListComponent } from './permitted-ip-list.component';

describe('PermittedIpListComponent', () => {
  let component: PermittedIpListComponent;
  let fixture: ComponentFixture<PermittedIpListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermittedIpListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermittedIpListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
