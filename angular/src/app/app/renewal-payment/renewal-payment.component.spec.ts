import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewalPaymentComponent } from './renewal-payment.component';

describe('RenewalPaymentComponent', () => {
  let component: RenewalPaymentComponent;
  let fixture: ComponentFixture<RenewalPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenewalPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenewalPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
