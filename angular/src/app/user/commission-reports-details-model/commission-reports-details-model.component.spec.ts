import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionReportsDetailsModelComponent } from './commission-reports-details-model.component';

describe('CommissionReportsDetailsModelComponent', () => {
  let component: CommissionReportsDetailsModelComponent;
  let fixture: ComponentFixture<CommissionReportsDetailsModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionReportsDetailsModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionReportsDetailsModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
