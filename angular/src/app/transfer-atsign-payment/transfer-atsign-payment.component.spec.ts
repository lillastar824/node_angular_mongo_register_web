import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferAtsignPaymentComponent } from './transfer-atsign-payment.component';

describe('TransferAtsignPaymentComponent', () => {
  let component: TransferAtsignPaymentComponent;
  let fixture: ComponentFixture<TransferAtsignPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferAtsignPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferAtsignPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
