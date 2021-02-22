import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickasignComponent } from './pickasign.component';
import { HomeCommonComponent } from '../home-common/home-common.component';

describe('PickasignComponent', () => {
  let component: PickasignComponent;
  let fixture: ComponentFixture<PickasignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickasignComponent,
      HomeCommonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickasignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
