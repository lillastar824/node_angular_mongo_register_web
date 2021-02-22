
import { CookieService } from 'ngx-cookie-service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

declare let gtag: Function;

const svgIcons = ['congrats','atom', 'robot','robot-alt','back','copy','history','preview','@sign','check','infinity','invite','briefcase','notifications','purchase-history','verification-methods','customize','reboot','transfer-in','transfer-out']
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = '@sign';
    constructor(private activatedRoute: ActivatedRoute, private cookieService: CookieService, private titleService: Title, private router: Router, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
      svgIcons.map((icon)=>{
        this.matIconRegistry.addSvgIcon(
          icon,
          this.domSanitizer.bypassSecurityTrustResourceUrl(`../../../assets/svg-icons/${icon}.svg`)
        );
      })
      this.matIconRegistry.addSvgIcon(
        "elipses",
        this.domSanitizer.bypassSecurityTrustResourceUrl("../../../assets/svg-icons/icon-elipses.svg")
      );
      this.matIconRegistry.addSvgIcon(
        "guage",
        this.domSanitizer.bypassSecurityTrustResourceUrl("../../../assets/svg-icons/icon-guage.svg")
      );
      this.matIconRegistry.addSvgIcon(
        "logout",
        this.domSanitizer.bypassSecurityTrustResourceUrl("../../../assets/svg-icons/icon-logout.svg")
      );
      this.matIconRegistry.addSvgIcon(
        "question",
        this.domSanitizer.bypassSecurityTrustResourceUrl("../../../assets/svg-icons/icon-question.svg")
      );
      this.matIconRegistry.addSvgIcon(
        "shopping",
        this.domSanitizer.bypassSecurityTrustResourceUrl("../../../assets/svg-icons/icon-shopping.svg")
      );
      this.matIconRegistry.addSvgIcon(
        "create",
        this.domSanitizer.bypassSecurityTrustResourceUrl("../../../assets/svg-icons/icon-create.svg")
      );
      this.matIconRegistry.addSvgIcon(
        "sad",
        this.domSanitizer.bypassSecurityTrustResourceUrl("../../../assets/svg-icons/icon-sad.svg")
      );

      this.matIconRegistry.addSvgIcon(
        "alien",
        this.domSanitizer.bypassSecurityTrustResourceUrl("../../../assets/svg-icons/icon-alien.svg")
      );
      this.matIconRegistry.addSvgIcon(
        "spacecat",
        this.domSanitizer.bypassSecurityTrustResourceUrl("../../../assets/svg-icons/icon-spacecat.svg")
      );
      this.matIconRegistry.addSvgIcon(
        "addbag",
        this.domSanitizer.bypassSecurityTrustResourceUrl("../../../assets/svg-icons/icon-addbag.svg")
      );
        // const navEndEvent$ = router.events.pipe(
        //     filter(e => e instanceof NavigationEnd)
        //   );
        //   navEndEvent$.subscribe((e: NavigationEnd) => {
        //     gtag('config', 'UA-149270210-1', {'page_path': e.urlAfterRedirects});
        //   });
     }

    ngOnInit(): void {
        this.cookieService.set('connect.sid', new Date().getTime().toString());
        const appTitle = this.titleService.getTitle();
        this.router
            .events.pipe(
                filter(event => event instanceof NavigationEnd),
                map(() => {
                    const child = this.activatedRoute.firstChild;
                    if (child.snapshot.data['title']) {
                        return child.snapshot.data['title']['title'];
                    }
                    return appTitle;
                })
            ).subscribe((ttl: string) => {
                this.titleService.setTitle(ttl);
            });
    }
}
