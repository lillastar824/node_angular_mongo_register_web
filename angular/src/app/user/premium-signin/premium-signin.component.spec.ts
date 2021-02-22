import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumSigninComponent } from './premium-signin.component';

describe('PremiumSigninComponent', () => {
  let component: PremiumSigninComponent;
  let fixture: ComponentFixture<PremiumSigninComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PremiumSigninComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PremiumSigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
