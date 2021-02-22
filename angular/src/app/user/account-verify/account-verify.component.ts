import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { UserService } from '../../shared/services/user.service';
import { UtilityService } from '../../shared/services/utility.service';


@Component({
    selector: 'app-account-verify',
    templateUrl: './account-verify.component.html',
    styleUrls: ['./account-verify.component.css']
})
export class AccountVerifyComponent implements OnInit {

    email: string;
    code: string;
    inviteCode: string;
    upgradeHandle: boolean = false;
    user: Object = {};
    showSucessMessage: string;
    showErrorMessage: string;
    serverErrorMessages: string;
    verificationCodeSent: boolean = false;
    contactVerified: boolean = false;
    atsignName: string;
    atsignPrice: number;
    userDetails;
    resendCode: boolean = false;
    verifyField: string;
    suffixMessage: string;
    contact: string;
    verificationCode: string;
    noContactDetails: boolean = false;
    countryCode: string = '+1';
    sendCodeTo: string;
    model = {
        type: 'email'
    };
    formValidation: string = '';
    disableResend: boolean = true;
    clearOldValues: boolean = false;
    showTimer: boolean = false;
    showContent: boolean = false;

    constructor(public userService: UserService,
        private route: ActivatedRoute,
        private router: Router, private utilityService: UtilityService) {
        this.route.params.subscribe(params => {
            this.inviteCode = params["inviteCode"];

            this.userService.selectHandle['inviteCode'] = this.inviteCode;
        });

        if (!this.userService.selectHandle['email'] && !this.userService.selectHandle['contact'] && !this.inviteCode) {
            this.router.navigateByUrl('/premium-sign/' + this.inviteCode);
        }

        if(!this.inviteCode){
            let searchObject = {}
            if (this.userService.selectHandle.contact) {
              searchObject['contact'] = this.userService.selectHandle.contact;
            } else {
              searchObject['email'] = this.userService.selectHandle.email;
            }
            let createNewHandle =  this.userService.createNewHandle(searchObject).subscribe(res=>{
                console.log(createNewHandle,"createNewHandle");
            
                let inviteCode = res['user']['inviteCode'];
                this.userService.selectHandle['inviteCode'] = inviteCode
                if(!this.userService.selectHandle.payAmount) this.userService.selectHandle.payAmount = 100;
                if(!this.userService.selectHandle.atsignName) this.userService.selectHandle.atsignName = '';
                if(!this.userService.selectHandle.atsignType) this.userService.selectHandle.atsignType = 'paid';
                if(!this.userService.selectHandle.premiumHandleType) this.userService.selectHandle.atsignName = 'custom';
            })
            
          }
    }
    getArraysIntersection(a1,a2){
        return  a1.some(function(n) { return a2.indexOf(n) !== -1;});
    }
    
    
    ngOnInit() {
        this.userService.showTimer = true;
    }
    verificationCodeChangedHandler(code: string) {
        this.verificationCode = code
    }
}
