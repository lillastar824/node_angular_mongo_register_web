import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservedAtsignsComponent } from './reserved-atsigns.component';

describe('ReservedAtsignsComponent', () => {
  let component: ReservedAtsignsComponent;
  let fixture: ComponentFixture<ReservedAtsignsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservedAtsignsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservedAtsignsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
