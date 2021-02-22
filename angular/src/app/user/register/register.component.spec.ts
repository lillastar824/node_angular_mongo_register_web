import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { FormsModule }   from '@angular/forms';
import { DemoMaterialModule } from './../../material-module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PickerModule } from '@ctrl/ngx-emoji-mart'
import { CountdownModule } from 'ngx-countdown';
import {HttpClientTestingModule} from '@angular/common/http/testing'
import {RouterTestingModule} from '@angular/router/testing'
import { Routes, RouterModule, Router, ActivatedRoute } from "@angular/router";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterComponent ],
      imports:[
        FormsModule,
        DemoMaterialModule,
        FontAwesomeModule,
        PickerModule,
        CountdownModule,
        HttpClientTestingModule,
        RouterTestingModule,
        RouterModule.forRoot([]),
        BrowserAnimationsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
