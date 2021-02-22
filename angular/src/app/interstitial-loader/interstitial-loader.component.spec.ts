import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterstitialLoaderComponent } from './interstitial-loader.component';

describe('InterstitialLoaderComponent', () => {
  let component: InterstitialLoaderComponent;
  let fixture: ComponentFixture<InterstitialLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterstitialLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterstitialLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
