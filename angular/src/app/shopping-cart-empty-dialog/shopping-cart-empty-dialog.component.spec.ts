import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingCartEmptyDialogComponent } from './shopping-cart-empty-dialog.component';

describe('ShoppingCartEmptyDialogComponent', () => {
  let component: ShoppingCartEmptyDialogComponent;
  let fixture: ComponentFixture<ShoppingCartEmptyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShoppingCartEmptyDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingCartEmptyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
