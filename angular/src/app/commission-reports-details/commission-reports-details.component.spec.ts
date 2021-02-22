import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionReportsDetailsComponent } from './commission-reports-details.component';

describe('CommissionReportsDetailsComponent', () => {
  let component: CommissionReportsDetailsComponent;
  let fixture: ComponentFixture<CommissionReportsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionReportsDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionReportsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
