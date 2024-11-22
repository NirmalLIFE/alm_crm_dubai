import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteLogComponent } from './quote-log.component';

describe('QuoteLogComponent', () => {
  let component: QuoteLogComponent;
  let fixture: ComponentFixture<QuoteLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuoteLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
