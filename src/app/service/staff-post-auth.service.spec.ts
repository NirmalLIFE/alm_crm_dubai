import { TestBed } from '@angular/core/testing';

import { StaffPostAuthService } from './staff-post-auth.service';

describe('StaffPostAuthService', () => {
  let service: StaffPostAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaffPostAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
