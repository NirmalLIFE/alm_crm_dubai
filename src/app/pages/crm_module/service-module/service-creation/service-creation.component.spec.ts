import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCreationComponent } from './service-creation.component';

describe('ServiceCreationComponent', () => {
  let component: ServiceCreationComponent;
  let fixture: ComponentFixture<ServiceCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceCreationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
