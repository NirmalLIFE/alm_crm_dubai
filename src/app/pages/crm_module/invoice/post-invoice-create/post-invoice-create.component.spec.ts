import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostInvoiceCreateComponent } from './post-invoice-create.component';

describe('PostInvoiceCreateComponent', () => {
  let component: PostInvoiceCreateComponent;
  let fixture: ComponentFixture<PostInvoiceCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostInvoiceCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostInvoiceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
