import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AboutComponent } from './about.component';
import { HomeCommonComponent } from '../home-common/home-common.component';
import { RouterLinkDirectiveStub } from '../../testing/router-link-directive-stub';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UtilityService } from '../shared/services/utility.service';
import { PickerModule } from '@ctrl/ngx-emoji-mart'
import emojiRegexFunction from 'emoji-regex';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AboutComponent,
        HomeCommonComponent,
        RouterLinkDirectiveStub],
      imports: [MatMenuModule,
        FormsModule,
        MatDialogModule,
        RouterTestingModule,
        HttpClientTestingModule,
        PickerModule,
      ],
      providers: [MatBottomSheet,
        UtilityService],
        schemas: [
          CUSTOM_ELEMENTS_SCHEMA
        ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
