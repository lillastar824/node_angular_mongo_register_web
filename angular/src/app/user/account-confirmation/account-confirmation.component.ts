import { Component, OnInit } from '@angular/core';
import { Routes, RouterModule, Router, ActivatedRoute } from "@angular/router";
import { UserService } from '../../shared/services/user.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InviteLinkComponent } from '../../invite-link/invite-link.component'
import confetti from "canvas-confetti";

@Component({
    selector: 'app-account-confirmation',
    templateUrl: './account-confirmation.component.html',
    styleUrls: ['./account-confirmation.component.css']
})
export class AccountConfirmationComponent implements OnInit {

    userDetails: any = { email: "", inviteCode: "", atsignDetails: [] };
    user: any = {};
    email: string = "";
    showSuccessMessage: boolean = true;
    inviteLeft: number;
    cartData: any[];
    constructor(public userService: UserService,
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog) {
        this.userService.showTimer = false;
        if (!this.userService.selectHandle['email'] && !this.userService.selectHandle['contact']) {
            this.router.navigateByUrl('/dashboard',{replaceUrl: true});
        } else {
            this.cartData = [...this.userService.savedCartData];
            this.userService.cartData = [];
            this.user['email'] = this.userService.selectHandle['email'];
            this.user['contact'] = this.userService.selectHandle['contact'];
            this.user['inviteCode'] = this.userService.selectHandle['inviteCode'];
            // this.user['inviteCode'] = this.code;
            this.userService.getUserDetails(this.user).subscribe(
                res => {
                    this.userService.setToken(res['data']['token']);
                    this.userService.currentUserType = 'user';
                    this.userDetails = res['data']['user'];
                    let detailIndex = this.userDetails['atsignDetails'].length - 1;
                    const inviteLeft = 500 - this.userDetails['inviteFriendDetails'].length;
                    this.inviteLeft = inviteLeft > 0 ? inviteLeft : 0;
                    this.userService.selectHandle['atsignType'] = this.userDetails['atsignDetails'][detailIndex].atsignType ? this.userDetails['atsignDetails'][detailIndex].atsignType : 'free';
                    this.userService.selectHandle['atsignName'] = this.userDetails['atsignDetails'][detailIndex].atsignName;
                    this.userService.selectHandle['contact'] = this.userDetails['contact'];
                    this.userService.selectHandle['email'] = this.userDetails['email'];
                    var oneYearFromNow = this.userDetails['atsignDetails'][detailIndex].atsignCreatedOn ? new Date(this.userDetails['atsignDetails'][detailIndex].atsignCreatedOn) : new Date();
                    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                    this.userService.selectHandle['renewTime'] = new Date(oneYearFromNow).toLocaleString('default', { month: 'long' }) + ' ' + new Date(oneYearFromNow).getDate() + ', ' + new Date(oneYearFromNow).getFullYear();
                },
                err => {
                    //console.log(err);
                    this.router.navigateByUrl('/login',{replaceUrl: true});
                }
            );
        }
        // userService.selectHandle.renewDate="March 13, 2021";
    }

    ngOnInit() {
        var count = 400;
        var defaults = {
            origin: { y: 1 }
        };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }));
        }
        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        fire(0.2, {
            spread: 60,
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }

    ngOnDestroy(){
        this.userService.cartData = [];
        this.userService.savedCartData = [];
        this.userService.selectHandle.subTotal = 0;
    }
    
    navigateToDashboard() {
        this.userService.cartData = [];
        this.userService.savedCartData = [];
        this.router.navigateByUrl('/dashboard',{replaceUrl: true});
        this.userService.selectHandle.subTotal = 0;
    }

    navigateToCreateAtsign(){
        this.userService.createAnotherSign(this.userDetails['email'],this.userDetails['contact'],true);
    }
}
