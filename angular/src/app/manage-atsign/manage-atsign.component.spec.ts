import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAtsignComponent } from './manage-atsign.component';

describe('ManageAtsignComponent', () => {
  let component: ManageAtsignComponent;
  let fixture: ComponentFixture<ManageAtsignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageAtsignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAtsignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
