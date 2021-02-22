import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Routes, RouterModule, Router, ActivatedRoute } from "@angular/router";
import { UserService } from '../../shared/services/user.service';
import { FormControl, Validators } from '@angular/forms';
import { uniqueNamesGenerator, Config, adjectives, colors, animals, countries, names, starWars } from 'unique-names-generator';
import { interval } from 'rxjs';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { faSmile } from '@fortawesome/free-solid-svg-icons';
import { UtilityService } from '../../shared/services/utility.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

    faCheckCircle = faCheckCircle;
    faTimesCircle = faTimesCircle;
    faSmile = faSmile;
    email: string;
    code: string;
    inviteCode: string;
    upgradeHandle: boolean = false;
    // atsignAvailable: boolean=false;
    atsignSuccessMessage: string;
    atsignErrorMessage: string;
    showSucessMessage: string;
    showErrorMessage: string;
    serverErrorMessages: string;
    user: Object = {};
    userDetails;

    showTimer: boolean = false;
    showEmojiPicker: boolean = false;
    typeSelected: string = 'Standard'

    atsignName: string;
    atsignPrice: number;
    payAmount: number;
    indexvalue: number;
    constructor(public userService: UserService,
        private route: ActivatedRoute,
        private router: Router, private utilityService: UtilityService) {
        this.showSucessMessage = "";
        this.userService.showTimer = false;
        this.route.params.subscribe(params => {
            this.inviteCode = params.inviteCode;
            console.log(params)
        });

        //friend invite(will do later)
        if (this.inviteCode) {
            // this.userService.checkFriendInviteValid({ "inviteCode": this.inviteCode }).subscribe(
            //     res => {
            //         if (res['status'] === "success") {
            //             this.userService.setToken(res['data']['token']);
            //             this.userService.selectHandle['friendsInviteCode'] = this.inviteCode;
            //             this.userService.selectHandle['contact'] = res['data']['user']['contact'];
            //     this.userService.selectHandle['email'] = res['data']['user']['email'];
            //     this.userService.selectHandle['inviteCode'] = this.inviteCode;
            //     this.userService.selectHandle['user_id'] = res['data']['user']['_id'];
            //         } else {
            //             // this.router.navigateByUrl('/login');
            //         }
            //     }, err => {
            //         // this.router.navigateByUrl('/login');
            //     }
            // );


        }
        // userService.selectHandle.email = this.email;
    }
    ngOnInit() {
        const token = this.userService.getToken();
        this.userService.getUserDetails({ inviteCode: this.inviteCode }).subscribe(
            res => {
                if (res['status'] === "success") {
                    this.userService.setToken(res['data']['token']);
                    this.userDetails = res['data']['user'];
                    this.userService.currentUserType = 'user';
                    this.indexvalue = this.userDetails['atsignDetails'].length - 1;
                    // this.userService.selectHandle['atsignType'] = this.userDetails['atsignDetails'][this.indexvalue]['atsignType'];
                    // this.userService.selectHandle['atsignName'] = this.userDetails['atsignDetails'][this.indexvalue]['atsignName'];
                    this.userService.selectHandle['atsignType'] = '';
                    this.userService.selectHandle['atsignName'] = '';
                    this.userService.selectHandle['contact'] = this.userDetails['contact'];
                    this.userService.selectHandle['email'] = this.userDetails['email'];
                    this.userService.selectHandle['inviteCode'] = this.code;
                    this.userService.selectHandle['user_id'] = this.userDetails['_id'];
                } else {
                    this.router.navigateByUrl('/login');
                }
            },
            err => {
                console.log(err);
                this.router.navigateByUrl('/login');
            }
        );
    }

    handleFormControl = new FormControl('', [
        Validators.required
    ]);
    createSign(form: NgForm) {
        if (form.value.atsignType === 'free') {
                this.userService.freesignCount().subscribe(res => {
                    if (res['status'] === "success") {
                        this.userService.selectHandle['atsignType'] = 'free';
                        this.router.navigateByUrl('/standard-sign/' + this.inviteCode);
                    }
                    else {
                        this.showErrorMessage = "Sorry you are limited to 10 free @signs. You can have unlimited premium @signs."
                    }
                });
        } else {
            this.userService.selectHandle['atsignType'] = 'paid';
                this.router.navigateByUrl('/premium-sign/' + this.inviteCode);
        }
    }

    @ViewChild('childMenu', { static: true }) public childMenu: any;

    resetAtsign(event: any) {
        this.userService.selectHandle.atsignName = '';
        this.atsignSuccessMessage = '';
        this.atsignErrorMessage = '';
    }
}
