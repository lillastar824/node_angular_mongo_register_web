import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeactivateModalComponent } from './confirm-deactivate-modal.component';

describe('ConfirmDeactivateModalComponent', () => {
  let component: ConfirmDeactivateModalComponent;
  let fixture: ComponentFixture<ConfirmDeactivateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmDeactivateModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDeactivateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
