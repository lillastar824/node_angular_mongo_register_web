import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionAtsignModelComponent } from './commission-atsign-model.component';

describe('CommissionAtsignModelComponent', () => {
  let component: CommissionAtsignModelComponent;
  let fixture: ComponentFixture<CommissionAtsignModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionAtsignModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionAtsignModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
