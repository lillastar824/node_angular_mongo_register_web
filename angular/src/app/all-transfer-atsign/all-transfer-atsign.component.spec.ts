import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTransferAtsignComponent } from './all-transfer-atsign.component';

describe('AllTransferAtsignComponent', () => {
  let component: AllTransferAtsignComponent;
  let fixture: ComponentFixture<AllTransferAtsignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllTransferAtsignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllTransferAtsignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
