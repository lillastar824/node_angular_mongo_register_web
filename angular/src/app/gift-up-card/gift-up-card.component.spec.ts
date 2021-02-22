import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftUpCardComponent } from './gift-up-card.component';

describe('GiftUpCardComponent', () => {
  let component: GiftUpCardComponent;
  let fixture: ComponentFixture<GiftUpCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GiftUpCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GiftUpCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
