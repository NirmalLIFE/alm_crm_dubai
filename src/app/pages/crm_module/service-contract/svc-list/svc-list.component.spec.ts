import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvcListComponent } from './svc-list.component';

describe('SvcListComponent', () => {
  let component: SvcListComponent;
  let fixture: ComponentFixture<SvcListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SvcListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SvcListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
