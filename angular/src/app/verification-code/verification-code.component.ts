import { Component, Output, OnInit, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { UserService } from '../shared/services/user.service';
import { UtilityService } from '../shared/services/utility.service';
import { Location } from "@angular/common";

@Component({
    selector: 'app-verification-code',
    templateUrl: './verification-code.component.html',
    styleUrls: ['./verification-code.component.css']
})
export class VerificationCodeComponent implements OnInit {
    model = {
        email: '',
        atsign: '',
        password: '',
        contact: '',
        otp: '',
        type: 'atsign'
    };
    @Input() verificationCodeSend: boolean;
    showSucessMessage: string;
    serverErrorMessages: string;
    verificationCodeSent: boolean = false;
    getAtsign: boolean = false;
    contactVerified: boolean = false;
    verificationCode: string;
    suffixMessage: string = "Email";
    suffixMessageToSend: string = "Email";
    disableResend: boolean = true;
    formValidation: string = '';
    resendPrefix: boolean = false;
    clearOldValues: boolean = false;
    showWaitModeTimer: boolean = false;
    countryCode: string = '+1';
    sendCodeTo: string;
    verificationCodeOtp: any = {};
    showScreen: boolean = false;
    @Output() verificationCodeSending: EventEmitter<any> = new EventEmitter<any>();
    isFromLogin: boolean = false;
    inviteCode: any;
    alternateVerificationMsg: string;
    clicked = false;
    emailDomain: boolean;

    constructor(private userService: UserService,
        private router: Router,
        private utilityService: UtilityService,
        private route: ActivatedRoute,
        private location: Location) {
        if (location.path().indexOf('login') !== -1) {
            this.isFromLogin = true;
        }
        this.route.params.subscribe(params => {
            this.inviteCode = params["inviteCode"];
        });
    }

    ngOnInit() {
        if (this.userService.homeEmail) {
            this.model.email = this.userService.homeEmail;
        }
        if (!this.isFromLogin) {
            if (this.userService.selectHandle['email']) {
                this.model.type = 'email';
                this.model.email = this.userService.selectHandle['email'];
                this.sendVerificationCode(this.userService.selectHandle['email']);
                this.alternateVerificationMsg = this.userService.selectHandle.contact ? 'Text me instead':'';
            } else if (this.userService.selectHandle['contact']) {
                this.model.type = 'mobile';
                this.model.email = this.userService.selectHandle['contact'];
                this.sendVerificationCode(this.userService.selectHandle['contact']);
                this.alternateVerificationMsg = this.userService.selectHandle.email ? 'Email me instead':'';
            } else {
                this.router.navigateByUrl('/premium-sign/' + this.inviteCode);
            }
        } else {
            this.showScreen = true;
        }

    }
    ngOnChanges(changes: SimpleChanges): void {
        this.verificationCodeSent = this.verificationCodeSend;
        this.serverErrorMessages = '';
    }
    onCountryChange(e) {
        this.countryCode = '+' + e.dialCode;

    }
    sendVerificationCode(email) {
        // this.someEvent.next(email);
        // return;
        this.formValidation = '';
        this.serverErrorMessages = '';
        this.getAtsign = false;
        this.clicked = true;
        email = email.trim();
        if (email) {

            var data = {};
            if (this.model.type === 'email') {
                if (this.utilityService.checkEmailValid(email)) {
                    this.suffixMessage = "Email";
                    this.suffixMessageToSend = "Email";
                    data['email'] = email.toLowerCase();
                    this.sendCodeTo = email;
                    if(email.includes('@gmail.com')){
                        this.emailDomain = true;
                    }
                } else {
                    this.clicked = false;
                    this.formValidation = 'Please enter a valid email address.';
                    return;
                }
            } else if (this.model.type === 'mobile') {
                let sct = email;
                if (!this.userService.selectHandle['contact'] || email[0] !== '+') {
                    sct = this.countryCode + email;
                    email = this.countryCode +' '+ this.utilityService.contactUglify(email);
                }
                
                if (this.utilityService.checkMobileValid(email)) {
                    this.suffixMessage = "messages";
                    this.suffixMessageToSend = "Number";
                    data['contact'] = email;
                    this.sendCodeTo = sct;
                } else {
                    this.clicked = false;
                    this.formValidation = 'Please enter a valid mobile number ('+this.countryCode+'(222) 222-2222).';
                    return;
                }
            }
            else if (this.model.type === 'atsign') {
                if (this.utilityService.checkAtsignValid(email)) {
                    this.suffixMessage = " registered Email or Mobile";
                    this.suffixMessageToSend = "@sign";
                    data['atsign'] = email;
                    this.sendCodeTo = ' your registered Email or Mobile.';
                } else {
                    this.formValidation = 'Please enter a valid @sign.';
                    return;
                }
            }
            this.disableResend = true;
            if(this.showWaitModeTimer)
            {
                return;
            }
            this.showWaitModeTimer = true;
            if (this.userService.selectHandle['inviteCode']) {
                data['inviteCode'] = this.userService.selectHandle['inviteCode'];
            }
            if(this.router.url.indexOf("login") > -1) data['isApplicationLogin'] = true
            // data['email'] = this.email;
            this.userService.sendVerificationCode(data).subscribe(
                res => {


                    // if(res['status'] === 'error')
                    // {
                    //     this.serverErrorMessages = res['message'];
                    // }
                    // else
                    {
                        if (res['status'] === 'success') {
                            if (res['data'] && res['data']['atsign']) {
                                this.getAtsign = true;
                                this.verificationCodeSent = true;
                            }
                            else {
                                this.showSucessMessage = res['message'];
                                this.verificationCodeSent = true;
                                this.showScreen = true;
                                this.clearOldValues = false;
                                this.verificationCodeOtp = {};
                                setTimeout(() => {
                                    this.showWaitModeTimer = false;
                                    this.disableResend = false;
                                }, 15000)
                                let obj = {
                                    'code': this.verificationCodeSent,
                                    'message': this.suffixMessageToSend
                                }
                                this.verificationCodeSending.emit(obj);
                            }
                        }

                    }

                },
                err => {
                    if (err.status === 422) {
                        this.serverErrorMessages = err.error.join('<br/>');
                    }
                    else {
                        //@todo remove duplicate code
                        this.verificationCodeSent = true;
                        this.clearOldValues = false;
                        this.verificationCodeOtp = {};
                        setTimeout(() => {
                            this.showWaitModeTimer = false;
                            this.disableResend = false;
                        }, 15000)
                        let obj = {
                            'code': this.verificationCodeSent,
                            'message': this.suffixMessageToSend
                        }
                        this.verificationCodeSending.emit(obj);
                    }
                }
            );
        } else {
            this.serverErrorMessages = "@sign or Email or Mobile is required";
        }
    }
    verifyContact(email) {
        email = email.trim();
        if (this.verificationCode) {
            this.serverErrorMessages = "";
            var data = {};
            let toUpdate;
            data['mobileOtp'] = this.verificationCode;
            if (this.alternateVerificationMsg === 'Email me instead' || this.model.type === 'mobile') {
                if (!this.userService.selectHandle['contact'] || email[0] !== '+') {
                    data['contact'] = this.countryCode + ' ' + this.utilityService.contactUglify(email);
                } else {
                    data['contact'] = email;
                }
                toUpdate = 'contact';
            } else if (this.alternateVerificationMsg === 'Text me instead' || this.model.type === 'email') {
                data['email'] = email;
                toUpdate = 'email';
            } else if (this.model.type === 'atsign') {
                data['atsign'] = email;
                toUpdate = 'atsign';
            }
            if(this.router.url.indexOf("login") > -1) data['isApplicationLogin'] = true
            this.userService.verifyContact(data).subscribe(
                res => {
                    if(!res)
                    {
                        this.serverErrorMessages = 'Something went wrong. Please try again after sometime.';
                    }
                    else if (res['status'] === 'success') {
                        this.showSucessMessage = res['message'];
                        this.contactVerified = true;
                        this.userService.setToken(res['token']);
                        if (!this.isFromLogin) {
                            if (toUpdate == 'atsign') {
                                this.userService.selectHandle['email'] = res['user']['email'];
                            } else {
                                this.userService.selectHandle[toUpdate] = email;
                            }
                            this.proceedCheckout();
                        } else if(res['user'] ){
                            if (res['user']['userRole'] === 'User') {
                                this.router.navigate(['dashboard'], {state: {verifyUserContact : true } })
                            } 
                            else if (res['user']['userRole'] === 'Admin') {
                                this.router.navigateByUrl('/getallusers');
                            } 
                            else if (res['user']['userRole'] === 'AdminReport') {
                                this.router.navigateByUrl('/reports');
                            } 
                        }
                    } else {
                        this.serverErrorMessages = res['message'];
                    }
                },
                err => {
                    if(err && err.error)
                    {
                        if (err.status === 422) {
                            this.serverErrorMessages = err.error.join('<br/>');
                        }
                        else
                            this.serverErrorMessages = err.error.message;
                    }
                    else
                    {
                        this.serverErrorMessages = 'Something went wrong. Please try again.';
                    }
                   
                }
            );
        } else {
            this.serverErrorMessages = "Verification Code is required.";
        }
    }
    keytab(event) {
        if (event.keyCode === 86) {
            return false;
        }        
        var inp = String.fromCharCode(event.keyCode);  
        let name = event.target.getAttribute("name");      
        if (/[a-zA-Z0-9]/.test(inp)) {
            if (event.target.value != event.key) {
                event.target.value = event.key;
                this.verificationCodeOtp[name] = event.key;
            }
        }
        else if (event.keyCode === 229) {
            if (event.target.value.length > 0) {
                this.verificationCodeOtp[name] = event.target.value.charAt(event.target.value.length - 1)
                event.target.value = event.target.value.charAt(event.target.value.length - 1);
            }

        }
        
        if (
          event.keyCode === 8 &&
          event.target.value.length === 0 &&
          event.target.closest("mat-form-field")
        //   .previousSibling &&
        //   event.target
        //     .closest("mat-form-field")
        //     .previousSibling.querySelector("input")
        ) {
          event.target
            .closest("mat-form-field")
            // .previousSibling.querySelector("input")
            // .focus();
        //   event.target
        //     .closest("mat-form-field")
        //     .previousSibling.querySelector("input").value = "";
        } else if (
          !(event.keyCode === 16 && event.keyCode === 9) &&
          event.target.value.length === event.target.maxLength
        ) {
          event.target.closest("mat-form-field").nextElementSibling &&
            event.target
              .closest("mat-form-field")
              .nextElementSibling.querySelector("input")
              .focus();
        }
        this.verificationCode =
          this.verificationCodeOtp.otp1 +
          this.verificationCodeOtp.otp2 +
          this.verificationCodeOtp.otp3 +
          this.verificationCodeOtp.otp4;
    }
    async proceedCheckout() {
        if (this.userService.selectHandle.atsignType === 'free') {
            await this.userService.updateReserveAtsign({ atsignName: this.userService.selectHandle.atsignName, type: 'is_verified' }).toPromise();
        } else {
            await this.userService.updateReserveAtsign({ cart: this.userService.cartData, type: 'is_verified' }).toPromise();
        }
        for (let i = 0; i < this.userService.cartData.length; i++) {
            this.userService.cartData[i].is_verified = true;
        }
        this.router.navigateByUrl('/checkout');
    }
    resendVerificationCode() {
        this.clicked = false;
        if(this.userService.getToken() && !this.isFromLogin){
            let email;
            if (this.model.type === 'email') {
                email = this.userService.selectHandle.email;
            } else if (this.model.type === 'mobile') {
                email = this.userService.selectHandle.contact;
            }
            this.sendVerificationCode(email);
            this.resendPrefix = true;
        }else{
            this.countryCode = '+1';
            this.verificationCodeSent = false;
            this.showWaitModeTimer = false;
            this.serverErrorMessages='';
            this.model.email='';
            this.model.contact='';
            this.suffixMessageToSend='';
            let obj = {
                'code': null,
                'message': ''
            }
            this.verificationCodeSending.emit(obj);
        }
    }

    sendAlternateCode() {
        if (this.model.type === 'email') {

            this.model.email = this.userService.selectHandle['contact'];
            this.model.type = 'mobile';
            this.alternateVerificationMsg = "Email me instead";
            this.sendVerificationCode(this.userService.selectHandle.contact);
        } else if (this.model.type === 'mobile') {
            this.model.type = 'email';
            this.model.email = this.userService.selectHandle['email'];
            this.alternateVerificationMsg = 'Text me instead';
            this.sendVerificationCode(this.userService.selectHandle.email);
            console.log(this.userService.selectHandle.email);
        }
    }

    onOTPPaste($event) {
        $event.preventDefault();
        let clipboardData = $event.clipboardData || (<any>window).clipboardData;
        let pastedCode = clipboardData.getData('text');

        this.verificationCodeOtp = {};
            let codes = pastedCode.split('');
            for(let i=0; i<4; i++) {
                if(codes[i]) {
                    this.verificationCodeOtp[`otp${i+1}`] = codes[i]
                }
            }   
            this.verificationCode =
          this.verificationCodeOtp.otp1 +
          this.verificationCodeOtp.otp2 +
          this.verificationCodeOtp.otp3 +
          this.verificationCodeOtp.otp4;     
    }

    resetErrorMessage()
    {
        this.clicked = false; this.verificationCodeSent = false; this.model.email = ''; this.formValidation = ''; this.resendPrefix = false; 
    }
}
