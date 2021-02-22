import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarSignInComponent } from './similar-sign-in.component';

describe('SimilarSignInComponent', () => {
  let component: SimilarSignInComponent;
  let fixture: ComponentFixture<SimilarSignInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimilarSignInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimilarSignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
