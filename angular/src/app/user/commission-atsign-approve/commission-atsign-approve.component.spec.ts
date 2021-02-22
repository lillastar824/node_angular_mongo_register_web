import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionAtsignApproveComponent } from './commission-atsign-approve.component';

describe('CommissionAtsignApproveComponent', () => {
  let component: CommissionAtsignApproveComponent;
  let fixture: ComponentFixture<CommissionAtsignApproveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionAtsignApproveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionAtsignApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
