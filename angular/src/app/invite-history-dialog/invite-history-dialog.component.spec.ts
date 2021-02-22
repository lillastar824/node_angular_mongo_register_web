import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteHistoryDialogComponent } from './invite-history-dialog.component';

describe('InviteHistoryDialogComponent', () => {
  let component: InviteHistoryDialogComponent;
  let fixture: ComponentFixture<InviteHistoryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InviteHistoryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteHistoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
