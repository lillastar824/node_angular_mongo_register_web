import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingCartDialogComponent } from './shopping-cart-dialog.component';

describe('ShoppingCartDialogComponent', () => {
  let component: ShoppingCartDialogComponent;
  let fixture: ComponentFixture<ShoppingCartDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShoppingCartDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingCartDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
