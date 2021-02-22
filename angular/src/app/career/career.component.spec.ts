import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerComponent } from './career.component';
import {HomeCommonComponent} from '../home-common/home-common.component';
import { RouterLinkDirectiveStub } from '../../testing/router-link-directive-stub';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('CareerComponent', () => {
  let component: CareerComponent;
  let fixture: ComponentFixture<CareerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CareerComponent,
        HomeCommonComponent,
        RouterLinkDirectiveStub],
        imports: [MatMenuModule,
          FormsModule,
          MatDialogModule,
          RouterTestingModule,
          HttpClientTestingModule,
        ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CareerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
