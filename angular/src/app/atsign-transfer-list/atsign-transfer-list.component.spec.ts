import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AtsignTransferListComponent } from './atsign-transfer-list.component';

describe('AtsignTransferListComponent', () => {
  let component: AtsignTransferListComponent;
  let fixture: ComponentFixture<AtsignTransferListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtsignTransferListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtsignTransferListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
