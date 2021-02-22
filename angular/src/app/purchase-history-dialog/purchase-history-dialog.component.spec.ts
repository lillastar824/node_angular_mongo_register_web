import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseHistoryDialogComponent } from './purchase-history-dialog.component';

describe('PurchaseHistoryDialogComponent', () => {
  let component: PurchaseHistoryDialogComponent;
  let fixture: ComponentFixture<PurchaseHistoryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseHistoryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseHistoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
