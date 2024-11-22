import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteVersionsComponent } from './quote-versions.component';

describe('QuoteVersionsComponent', () => {
  let component: QuoteVersionsComponent;
  let fixture: ComponentFixture<QuoteVersionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuoteVersionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
