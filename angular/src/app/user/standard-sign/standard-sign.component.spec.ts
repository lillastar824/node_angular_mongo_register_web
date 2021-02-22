import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardSignComponent } from './standard-sign.component';

describe('StandardSignComponent', () => {
  let component: StandardSignComponent;
  let fixture: ComponentFixture<StandardSignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StandardSignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandardSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
