import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteContactDialogComponent } from './confirm-delete-contact-dialog.component';

describe('ConfirmDeleteContactDialogComponent', () => {
  let component: ConfirmDeleteContactDialogComponent;
  let fixture: ComponentFixture<ConfirmDeleteContactDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmDeleteContactDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDeleteContactDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
