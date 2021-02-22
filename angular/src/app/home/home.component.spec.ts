import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { FormsModule }   from '@angular/forms';
import {HttpClientTestingModule} from '@angular/common/http/testing'
import { HomeCommonComponent } from '../home-common/home-common.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let home;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeComponent,
        HomeCommonComponent ],
      imports:[
        HttpClientTestingModule,
        FormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    home = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have showInviteBox false', () => {
    // const fixture = TestBed.createComponent(HomeComponent);
    expect(home.showInviteBox).toEqual(false);
  });
  it('should click getStarted', async(() => {
    // spyOn(component, 'getStarted');
  
    let button = fixture.debugElement.nativeElement.querySelector('button');
    button.click();
  
    fixture.whenStable().then(() => {
        // expect(component.getStarted).toHaveBeenCalled();
    //     fixture.detectChanges();
    //     home = fixture.debugElement.componentInstance;
    //   expect(home.showInviteBox).toEqual(true);
    });
  }));
});
