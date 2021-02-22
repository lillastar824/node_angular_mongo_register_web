import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCommonComponent } from './home-common.component';

import { RouterTestingModule } from '@angular/router/testing';
import { SpyLocation } from '@angular/common/testing';

import { Router, RouterLinkWithHref } from '@angular/router';

import { By } from '@angular/platform-browser';
import { DebugElement, Type, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLinkDirectiveStub } from '../../testing/router-link-directive-stub';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('HomeCommonComponent', () => {
  let component: HomeCommonComponent;
  let fixture: ComponentFixture<HomeCommonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeCommonComponent,
        RouterLinkDirectiveStub],
        imports: [MatMenuModule,
          FormsModule,
          MatDialogModule,
          RouterTestingModule,
          HttpClientTestingModule,
        ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});



// @Component({selector: 'app-banner', template: ''})
// class BannerStubComponent {}

// @Component({selector: 'router-outlet', template: ''})
// class RouterOutletStubComponent { }

// @Component({selector: 'app-welcome', template: ''})
// class WelcomeStubComponent {}

// let comp:    HomeCommonComponent;
// let fixture: ComponentFixture<HomeCommonComponent>;

// describe('HomeCommonComponent & TestModule', () => {
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [
//         HomeCommonComponent,
//         RouterLinkDirectiveStub
//       ]
//     })
//     .compileComponents().then(() => {
//       fixture = TestBed.createComponent(HomeCommonComponent);
//       comp    = fixture.componentInstance;
//     });
//   }));
//   tests();
// });

// //////// Testing w/ NO_ERRORS_SCHEMA //////
// describe('HomeCommonComponent & NO_ERRORS_SCHEMA', () => {
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [
//         HomeCommonComponent,
//         RouterLinkDirectiveStub
//       ],
//       schemas: [ NO_ERRORS_SCHEMA ]
//     })
//     .compileComponents().then(() => {
//       fixture = TestBed.createComponent(HomeCommonComponent);
//       comp    = fixture.componentInstance;
//     });
//   }));
//   tests();
// });

// //////// Testing w/ real root module //////
// // Tricky because we are disabling the router and its configuration
// // Better to use RouterTestingModule
// import { AppModule }    from '../app.module';
// import { appRoutes } from '../routes';

// describe('HomeCommonComponent & AppModule', () => {

//   beforeEach(async(() => {

//     TestBed.configureTestingModule({
//       imports: [ AppModule ]
//     })

//     // Get rid of app's Router configuration otherwise many failures.
//     // Doing so removes Router declarations; add the Router stubs
//     .overrideModule(AppModule, {
//       remove: {
//         imports: [ appRoutes ]
//       },
//       add: {
//         declarations: [ RouterLinkDirectiveStub ]
//       }
//     })

//     .compileComponents()

//     .then(() => {
//       fixture = TestBed.createComponent(HomeCommonComponent);
//       comp    = fixture.componentInstance;
//     });
//   }));

//   tests();
// });

// function tests() {
//   let routerLinks: RouterLinkDirectiveStub[];
//   let linkDes: DebugElement[];

//   beforeEach(() => {
//     fixture.detectChanges(); // trigger initial data binding

//     // find DebugElements with an attached RouterLinkStubDirective
//     linkDes = fixture.debugElement
//       .queryAll(By.directive(RouterLinkDirectiveStub));

//     // get attached link directive instances
//     // using each DebugElement's injector
//     routerLinks = linkDes.map(de => de.injector.get(RouterLinkDirectiveStub));
//   });

//   it('can instantiate the component', () => {
//     expect(comp).not.toBeNull();
//   });

//   it('can get RouterLinks from template', () => {
//     expect(routerLinks.length).toBe(13, 'should have 13 routerLinks');
//     expect(routerLinks[0].linkParams).toBe('/about');
//     expect(routerLinks[1].linkParams).toBe('/developers');
//     expect(routerLinks[2].linkParams).toBe('/faq');
//   });

//   it('can click about link in template', () => {
//     const aboutLinkDe = linkDes[1];   // about link DebugElement
//     const aboutLink = routerLinks[1]; // about link directive

//     expect(aboutLink.navigatedTo).toBeNull('should not have navigated yet');

//     aboutLinkDe.triggerEventHandler('click', null);
//     fixture.detectChanges();

//     expect(aboutLink.navigatedTo).toBe('/about');
//   });
// }
