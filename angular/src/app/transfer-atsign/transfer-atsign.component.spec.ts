import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferAtsignComponent } from './transfer-atsign.component';

describe('TransferAtsignComponent', () => {
  let component: TransferAtsignComponent;
  let fixture: ComponentFixture<TransferAtsignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferAtsignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferAtsignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
