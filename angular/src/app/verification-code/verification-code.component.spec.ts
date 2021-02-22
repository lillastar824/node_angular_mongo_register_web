import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { VerificationCodeComponent } from './verification-code.component';
import {MatRadioModule} from '@angular/material/radio';
import {Ng2TelInputModule} from 'ng2-tel-input';

import {
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatRippleModule
} from '@angular/material';
import { CountdownModule } from 'ngx-countdown';
import {HttpClientTestingModule} from '@angular/common/http/testing'
import {RouterTestingModule} from '@angular/router/testing'

describe('VerificationCodeComponent', () => {
  let component: VerificationCodeComponent;
  let fixture: ComponentFixture<VerificationCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule,
        MatRadioModule,
        MatFormFieldModule,
        Ng2TelInputModule,
        CountdownModule,
        HttpClientTestingModule,
        RouterTestingModule],

      declarations: [ VerificationCodeComponent,
         ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificationCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
