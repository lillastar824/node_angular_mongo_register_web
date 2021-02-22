import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualFeeDisclaimerComponent } from './annual-fee-disclaimer.component';

describe('AnnualFeeDisclaimerComponent', () => {
  let component: AnnualFeeDisclaimerComponent;
  let fixture: ComponentFixture<AnnualFeeDisclaimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnualFeeDisclaimerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnualFeeDisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
