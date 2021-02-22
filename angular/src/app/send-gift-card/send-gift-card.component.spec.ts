import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendGiftCardComponent } from './send-gift-card.component';

describe('SendGiftCardComponent', () => {
  let component: SendGiftCardComponent;
  let fixture: ComponentFixture<SendGiftCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendGiftCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendGiftCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
