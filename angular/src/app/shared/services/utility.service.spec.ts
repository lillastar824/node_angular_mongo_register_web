import { TestBed, inject } from '@angular/core/testing';

import { UtilityService } from './utility.service';
import {HttpClientTestingModule} from '@angular/common/http/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import emojiRegexFunction from 'emoji-regex';

describe('UtilityService', () => {
  let emojiRegex = emojiRegexFunction();
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UtilityService],
      imports:[
        HttpClientTestingModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
    });
  });

  it('should be created', inject([UtilityService], (service: UtilityService) => {
    expect(service).toBeTruthy();
  }));
});
