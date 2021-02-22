import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionAtsignComponent } from './commission-atsign.component';

describe('CommissionAtsignComponent', () => {
  let component: CommissionAtsignComponent;
  let fixture: ComponentFixture<CommissionAtsignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionAtsignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionAtsignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
