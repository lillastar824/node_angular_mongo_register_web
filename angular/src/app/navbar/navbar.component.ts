import { Component, OnInit, ViewChild } from "@angular/core";
import { UserService } from '../shared/services/user.service';
import { CountdownComponent } from 'ngx-countdown';
import { Router, ActivatedRoute, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { Location } from "@angular/common";
import { HostListener } from '@angular/core';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { ShoppingCartEmptyDialogComponent } from '../shopping-cart-empty-dialog/shopping-cart-empty-dialog.component'
import { ShoppingCartDialogComponent } from '../shopping-cart-dialog/shopping-cart-dialog.component'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User, Role } from '../shared';
import { UtilityService } from "../shared/services/utility.service";
// import { setInterval } from "timers";

@Component({
    selector: "app-navbar",
    templateUrl: "./navbar.component.html",
    styleUrls: ["./navbar.component.css"]
})
export class NavbarComponent implements OnInit {
    // @ViewChild('countdown', { static: false }) private countdown: CountdownComponent;
    email: string;
    code: string;
    upgradeHandle: boolean = false;
    currentRoute: string;
    currentUser: User;
    cartInterval: any;
    showNavbar: boolean ;
    showToolbar: boolean = true;
    hideCreateNewAtsignLink: boolean = false;

    constructor(public userService: UserService,
        private route: ActivatedRoute,
        private utilityService: UtilityService,
        private router: Router,
        private location: Location,
        public dialog: MatDialog) {
        this.route.params.subscribe(params => {
            this.email = params["id"];
            this.code = params["code"];
            this.upgradeHandle = params['upgrade'] === 'false' ? false : true;
        });
        router.events.subscribe((event: Event) => {

            // if (event instanceof NavigationStart) {
            //     //console.log(location.path());
            //     // Show loading indicator
            //     //console.log("start");
            // }

            if (event instanceof NavigationEnd) {
                this.currentRoute = location.path();
                this.showToolbar = true;
                
                if ( !this.userService.isLoggedIn() && ['/login'].indexOf(this.currentRoute) !== -1 || this.currentRoute.includes('welcome')) {
                 //   console.log('from naavbar login')
                    // this.showToolbar = false;
                    this.showNavbar = false;
                }
                
                if (['/terms', '/developers', '/about', '/faq', '/signup', '/welcome', '/welcomep'].indexOf(this.currentRoute) !== -1) {
                   
                    this.showToolbar = false;
                    this.showNavbar = false;
                }

                if (['/gift-up-card'].indexOf(this.currentRoute) !== -1) {
                    this.hideCreateNewAtsignLink = true;
                }else{
                    this.hideCreateNewAtsignLink = false;
                }

            }

            if (event instanceof NavigationError) {
                //console.log("error");
                //console.log(event.error);
            }
        });
        this.userService.currentUser.subscribe(x => this.currentUser = x);
    }

    get isAdmin() {
        return this.currentUser && this.currentUser.role === Role.Admin;
    }
    get isUser() {
        return this.currentUser && this.currentUser.role === Role.User;
    }
    get isAdminReport() {
        return this.currentUser && this.currentUser.role === Role.AdminReport;
    }
    ngOnInit() {
        //on init after reload
        if (this.userService.isLoggedIn()) {
            // console.log('from naavbar')
            this.showNavbar = true;
            if(this.currentUser && this.currentUser.role === Role.User){
                this.getCartData();
            }
        }
        //after logging in
        this.userService.userLoggedIn.subscribe((params) => {
            if(this.currentUser && this.currentUser.role === Role.User){
                this.getCartData();
            }
            this.showNavbar = true;
            if (
                document.getElementsByClassName("cdk-overlay-container").length > 0
              ) {
                document.getElementsByClassName("cdk-overlay-container")[0]["style"].display = "block";
              }
        })
        //after logging out
        this.userService.userLoggedOut.subscribe((params) => {
            // console.log('from naavbar logou')
            clearInterval(this.cartInterval);
            if (!this.userService.isLoggedIn()) {
            this.showNavbar = false;
            }
        })
    }

    @HostListener("window:scroll", ['$event'])
    scrollMe(event) {
        //  if(window.scrollY > 0){
        //      document.querySelector('.navbar.inner-navbar').classList.add("scrolled");
        //  } else{
        //   document.querySelector('.navbar.inner-navbar').classList.remove("scrolled");
        //  }
    }
    async onLogout() {
        await this.userService.deleteToken();
        if (this.isAdmin || this.isAdminReport) {
            this.router.navigate(['/login/admin']);
        } else {
            this.userService.homeEmail='';
            this.userService.selectHandle['email']='';
            this.userService.selectHandle['contact']='';
            this.router.navigate(['/login']);
        }
    }
    handleEvent(e) {
        this.userService.timeLeft = e.left / 1000;
        if (e.action === 'done') {
            // if (this.location.path().indexOf("checkout") !== -1) {
            if (this.userService.selectHandle.atsignType === 'free') {
                this.userService.deleteReserveAtsign({ user_id: this.userService.selectHandle.user_id, atsignName: this.userService.selectHandle.atsignName }).toPromise();
                this.router.navigateByUrl('/standard-sign/' + this.userService.selectHandle.inviteCode);
            } else {
                for (let i = 0; i < this.userService.cartData.length; i++) {
                    this.userService.deleteReserveAtsign({ user_id: this.userService.selectHandle.user_id, atsignName: this.userService.cartData[i].atsignName }).toPromise();
                }
                this.router.navigateByUrl('/premium-sign/' + this.userService.selectHandle.inviteCode);
            }
            this.userService.showTimer = false;
            // this.userService.selectHandle.payAmount = 100;
            // this.userService.selectHandle.atsignName = '';
            this.userService.selectHandle.atsignType = 'paid';
            this.userService.selectHandle.subTotal = 0;
            this.userService.cartData = [];
            this.userService.selectHandle.premiumHandleType = 'custom';
        }
    }
    changePassword() {
        const dialogRef = this.dialog.open(ChangePasswordComponent, {
            width: '500px',
            data: {}
        });
        dialogRef.afterClosed().subscribe(result => {
        });
    }
    getCartData() {
        let cartData = [];
        let subTotal: number = 0;
        this.userService.getCartData(false).subscribe(res => {
            if (res['reservedsign'].length > 0) {
                this.userService.showTimer = res['timer'] > 0 ? true : false;
                this.userService.timeLeft = res['timer'];
                for (let i = 0; i < res['reservedsign'].length; i++) {
                    // if (res['reservedsign'][i]['price'] > 0) {
                    let data = {
                        "atsignName": res['reservedsign'][i]['atsignName'],
                        "premiumHandleType": this.utilityService.atSignTypeObject[res['reservedsign'][i]['atsignType']],
                        "payAmount": res['reservedsign'][i]['price'],
                        "is_verified": res['reservedsign'][i]['is_verified']
                    }
                    cartData.push(data);
                    subTotal += res['reservedsign'][i]['price'];
                }
                this.userService.commercialAtsignDiscountPercentage = 0
                if(res['orderAmountDetails'] && res['orderAmountDetails']['finalDiscountPercentage']){
                    this.userService.commercialAtsignDiscountPercentage =  res['orderAmountDetails']['finalDiscountPercentage'];
                }
                this.userService.cartData = cartData;
                this.userService.selectHandle.subTotal = subTotal;
            } else {
                this.userService.cartData = [];
                this.userService.selectHandle.subTotal = 0;
            }
            this.userService.selectHandle.atsignType = 'paid';
            // this.userService.selectHandle['inviteCode'] = this.userService.selectHandle['inviteCode'];
        });
    }

    openShoppingDialog() {
        this.getCartData();
        if (this.userService.cartLength > 0) {
            const dialogRef = this.dialog.open(ShoppingCartDialogComponent, {
                panelClass: 'fullscreen-dialog-panel',
                width: '100%',
                height: '100%',
                maxWidth: '100%',
            });
        } else {
            const dialogRef = this.dialog.open(ShoppingCartEmptyDialogComponent, {
                backdropClass: 'dark-overlay-backdrop',
                panelClass: ['top-center-panel', 'shopping-cart-empty-dialog'],
                width: '345px',
            });
        }
    }

    createAnotherSign() {
        this.userService.createAnotherSign(this.userService.selectHandle.email, this.userService.selectHandle.contact);
    }
}
