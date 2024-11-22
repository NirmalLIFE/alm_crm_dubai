import { TestBed } from '@angular/core/testing';

import { ThirdPartyApisService } from './third-party-apis.service';

describe('ThirdPartyApisService', () => {
  let service: ThirdPartyApisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThirdPartyApisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
