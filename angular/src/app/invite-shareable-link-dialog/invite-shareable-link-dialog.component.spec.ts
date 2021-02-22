import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteShareableLinkDialogComponent } from './invite-shareable-link-dialog.component';

describe('InviteShareableLinkDialogComponent', () => {
  let component: InviteShareableLinkDialogComponent;
  let fixture: ComponentFixture<InviteShareableLinkDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InviteShareableLinkDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteShareableLinkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
