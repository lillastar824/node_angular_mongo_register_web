import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateAtsignComponent } from './activate-atsign.component';

describe('ActivateAtsignComponent', () => {
  let component: ActivateAtsignComponent;
  let fixture: ComponentFixture<ActivateAtsignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateAtsignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateAtsignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
