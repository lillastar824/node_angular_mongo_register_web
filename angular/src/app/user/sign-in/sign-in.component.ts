import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Routes, RouterModule, Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { UtilityService} from '../../shared/services/utility.service';
import { counter } from '@fortawesome/fontawesome-svg-core';

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css']
})

export class SignInComponent implements OnInit {
    usertype: string;
    constructor(private userService: UserService, private router: Router, private utilityService: UtilityService, private route: ActivatedRoute) {
        this.route.params.subscribe(params => {
            this.usertype = params['type'];
        });
    }

    model = {
        email: '',
        password: '',
        contact: '',
        otp: ''
    };
    showSucessMessage: string;
    serverErrorMessages: string;
    verificationCodeSent: boolean = false;
    contactVerified: boolean = false;
    passwordSignIn: boolean = false;
    otpSignIn: boolean = true;
    verificationCode: string;
    suffixMessage: string = "";
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    ngOnInit() {
        // console.log('in2')
        // //console.log(this.usertype)
        if (
            document.getElementsByClassName("cdk-overlay-container").length > 0
          ) {
            document.getElementsByClassName("cdk-overlay-container")[0]["style"].display = "none";
          }
        
        // @todo
        // localStorage.removeItem('currentUser');
        // localStorage.removeItem('token');
        if (this.userService.isLoggedIn()) {
//            console.log('ini')
            //  this.userService.deleteToken();
            this.userService.getUserProfile().subscribe(
                res => {
                //    console.log('ini33')
                    if (res && res['user'] && res['user']['_id']  && res['user']['userRole'] === 'User') {
                        this.router.navigateByUrl('/dashboard');
                    } 
                    else if (res && res['user'] && res['user']['_id']  && res['user']['userRole'] === 'Admin') {
                        this.router.navigateByUrl('/getallusers');
                    } 
                    else if (res && res['user'] && res['user']['_id']  && res['user']['userRole'] === 'AdminReport') {
                        this.router.navigateByUrl('/reports');
                    } 
                    else {
                        localStorage.removeItem('currentUser');
                        localStorage.removeItem('token');
                    }
                },
                err => {
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('token');
                }
            )
        }
        else
        {
            // this.showToolbar = false;
            //         this.showNavbar = false;
          //  console.log('in')
            if (this.usertype === 'admin') {
                this.otpSignIn = false;
                 this.passwordSignIn = true;
             }
             this.userService.showTimer = false;
        }
    }
    verificationCodeChangedHandler(code) {
        this.verificationCodeSent = code.code;
        this.suffixMessage = code.message;
    }
    onSubmit(form: NgForm) {
        this.userService.login(form.value).subscribe(
            res => {
                this.userService.setToken(res['token']);
                if (res['user'].userRole === 'Admin') {
                    this.router.navigateByUrl('/getallusers');
                } else if (res['user'].userRole === 'AdminReport') {
                  this.router.navigateByUrl('/reports');
                } else {
                    this.router.navigateByUrl('/dashboard');
                }
            },
            err => {
                this.serverErrorMessages = err.error.message;
            }
        );
    }

}
