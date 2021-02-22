import { TestBed } from '@angular/core/testing';

import { InterstitialLoaderService } from './interstitial-loader.service';

describe('InterstitialLoaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InterstitialLoaderService = TestBed.get(InterstitialLoaderService);
    expect(service).toBeTruthy();
  });
});
