import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { UserService } from '../shared/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

    email: string;
    inviteCode: string;
    friendInviteCode: string;
    upgradeHandle: boolean = false;
    showSlides: boolean = false;
    alreadyUsedLink: boolean = false;
    invalidLink: boolean;
    constructor(private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private _snackBar: MatSnackBar) {
        this.route.params.subscribe(params => {
            this.inviteCode = params["inviteCode"];
        });
    }

    ngOnInit() {
        this.userService.checkInviteCodeValid(this.inviteCode).subscribe(
            res => {
                if (res['status'] === "error") {
                    if(res['data']['reason'] == 'invalid_code'){
                        this.invalidLink = true
                    }else if(res['data']['reason'] == 'code_used'){
                        this.alreadyUsedLink = true
                    }else{
                        this.invalidLink = false
                    }
                }else{
                    this.invalidLink = false
                }
            }
        );
    }
    getAtsign() {
        this.router.navigateByUrl(window.location.pathname.replace('welcomep', 'premium-sign').replace('welcome', 'premium-sign'));
    }
    openSlides() {
        this.showSlides = true;
        this.hideNavigationButton();
    }

    hideNavigationButton() {
        setTimeout(function () {
            let slideNumber = document.getElementsByClassName("slider-indicators active")[0].getAttribute("data-slide-to");
            let next = document.querySelectorAll('[data-slide="next"]')[0];
            let next1 = document.querySelectorAll('[data-slide="next"]')[1];
            let previous = document.querySelectorAll('[data-slide="prev"]')[0];
            let previous1 = document.querySelectorAll('[data-slide="prev"]')[1];
            if (parseInt(slideNumber) == 0) {
                previous['style'].visibility = 'hidden';
                previous1['style'].visibility = 'hidden';
                next['style'].visibility = 'visible';
                next1['style'].visibility = 'visible';
            }
            else if (parseInt(slideNumber) == 5) {
                next['style'].visibility = 'hidden';
                next1['style'].visibility = 'hidden';
                previous['style'].visibility = 'visible';
                previous1['style'].visibility = 'visible';
            }
            else {
                next['style'].visibility = 'visible';
                next1['style'].visibility = 'visible';
                previous['style'].visibility = 'visible';
                previous1['style'].visibility = 'visible';
            }
        }, 0);
    }
}

 