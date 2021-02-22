import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCommissionDashboardComponent } from './user-commission-dashboard.component';

describe('UserCommissionDashboardComponent', () => {
  let component: UserCommissionDashboardComponent;
  let fixture: ComponentFixture<UserCommissionDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserCommissionDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCommissionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
