import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignAtsignsComponent } from './assign-atsigns.component';

describe('AssignAtsignsComponent', () => {
  let component: AssignAtsignsComponent;
  let fixture: ComponentFixture<AssignAtsignsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignAtsignsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignAtsignsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
