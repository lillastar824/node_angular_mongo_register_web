import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasedSignsModalComponent } from './purchased-signs-modal.component';

describe('PurchasedSignsModalComponent', () => {
  let component: PurchasedSignsModalComponent;
  let fixture: ComponentFixture<PurchasedSignsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchasedSignsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchasedSignsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
