import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationMethodsDialogComponent } from './verification-methods-dialog.component';

describe('VerificationMethodsDialogComponent', () => {
  let component: VerificationMethodsDialogComponent;
  let fixture: ComponentFixture<VerificationMethodsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerificationMethodsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificationMethodsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
