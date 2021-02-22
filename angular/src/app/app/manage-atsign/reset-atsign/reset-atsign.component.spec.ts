import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetAtsignComponent } from './reset-atsign.component';

describe('ResetAtsignComponent', () => {
  let component: ResetAtsignComponent;
  let fixture: ComponentFixture<ResetAtsignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetAtsignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetAtsignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
