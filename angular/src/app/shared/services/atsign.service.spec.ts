import { TestBed } from '@angular/core/testing';

import { AtsignService } from './atsign.service';

describe('AtsignService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AtsignService = TestBed.get(AtsignService);
    expect(service).toBeTruthy();
  });
});
