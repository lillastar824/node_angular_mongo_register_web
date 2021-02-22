import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTransferAtsignComponent } from './admin-transfer-atsign.component';

describe('AdminTransferAtsignComponent', () => {
  let component: AdminTransferAtsignComponent;
  let fixture: ComponentFixture<AdminTransferAtsignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminTransferAtsignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTransferAtsignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
