import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableWaitListComponent } from './enable-wait-list.component';

describe('EnableWaitListComponent', () => {
  let component: EnableWaitListComponent;
  let fixture: ComponentFixture<EnableWaitListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnableWaitListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnableWaitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
