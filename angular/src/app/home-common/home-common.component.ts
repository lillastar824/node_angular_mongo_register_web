import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../shared/services/user.service';
import { UtilityService } from '../shared/services/utility.service';
import { HostListener } from '@angular/core';
import { Location } from "@angular/common";
import {ActivatedRoute,Router } from "@angular/router";
import { User, Role } from '../shared';

@Component({
    selector: 'app-home-common',
    templateUrl: './home-common.component.html',
    styleUrls: ['./home-common.component.css']
})
export class HomeCommonComponent implements OnInit {

    showInviteBox = false;
    showSucessMessage: boolean;
    serverErrorMessages: string;
    inviteSend: boolean = false;
    model: any = { email: '',
    atsign: '' };
    showErrorMessage: string = '';
    invalidEmail: boolean = false;
    activeUser: boolean = false;
    activeTab: string;
    atSignInvite: boolean = false;
    hasInviteCode: boolean = false;
    randomAtsign: string = '';
  randomOneSign: string;
  randomSigns: any = [];
  randomAtSignLimit: any = [];
  closeAtSign: any;
  closeClicked: boolean = false;
  hoverAtSign: any;
  atSignIndex: number = 0;
  currentUser: User;
    constructor(public userService: UserService, private utilityService : UtilityService, private route: ActivatedRoute,
        private location: Location,private router: Router) {
        this.model.email = '';
        // console.log(this.router.url)
        this.activeTab = this.router.url.replace('/','');
        // if (location.path().indexOf("about") !== -1) {
        //     this.activeTab = 'about';
        // } else
        //     if (location.path().indexOf("faq") !== -1) {
        //         this.activeTab = 'faq';
        //     } else
        //         if (location.path().indexOf("developers") !== -1) {
        //             this.activeTab = 'developers';
        //         } else
        //             if (location.path().indexOf("pickasign") !== -1) {
        //                 this.activeTab = 'pickasign';
        //             }
        //         else
        //             if (location.path().indexOf("career") !== -1) {
        //                 this.activeTab = 'career';
        //             }
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
        this.hasInviteCode = false;
        this.route.params.subscribe(params => {
            if(params["invitecode"]){
                this.model.atsign = params["invitecode"];
                this.hasInviteCode = true;
                this.showInviteBox = true;
                this.scroll(document.querySelector('#email'), 0);
               
            }
                   
        })
      this.userService.getRandomatSign().subscribe(
          (res) => {
              this.randomSigns = res['data'];
              for (const i in res['data']) {
                  if(res['data'][i].length>10){
                      this.randomSigns.splice(i,1);
                  }
                  this.randomAtsign += '@' + res['data'][i] + ' ';
              }
              if(this.randomSigns.length > 0)
                {
                    setTimeout(() => {
                        this.refreshAtSign();
                    },10000)
                }
          },
          (err) => {
              //console.log(err);
          }
      );
     
  }
  refreshAtSign() {
      this.closeClicked = false;
      const mover = document.getElementById('atSign');
     
      if(this.atSignIndex === this.randomSigns.length)
      {
          this.atSignIndex = 0;
      }
      this.randomOneSign = this.randomSigns[this.atSignIndex];
      this.atSignIndex++;
      
      if (!this.randomOneSign || (this.randomOneSign && this.randomOneSign.length > 10)) {
        this.refreshAtSign();
        return;
    }
      if(mover)
      {
          mover.style.opacity = '1';
          mover.className = 'randomAtSign bottomleft row go-right bounce';
          this.hoverAtSign = setTimeout(() => {
          mover.className = 'randomAtSign bottomleft row go-left';
          mover.classList.remove("bounce");
          mover.style.opacity = '0';
          clearInterval(this.closeAtSign);
          this.closeAtSign = setInterval(() => {
              this.refreshAtSign();
          }, (Math.floor(Math.random() * 20) + 6) * 1000)
      }, 10000)
      }
  }
  closeRandomSign() {
      this.closeClicked = true;
      document.getElementById('atSign').style.opacity = '0';
      document.getElementById('atSign').style.display = 'none';
      clearInterval(this.closeAtSign);
  }
  mouseEnter() {
      var mover = document.getElementById('atSign');
      mover.classList.remove("bounce");
      document.getElementById('atSign').style.opacity = '1';
      clearInterval(this.closeAtSign);
      clearTimeout(this.hoverAtSign);
  }
  mouseLeave() {
      // alert(2)
      var mover = document.getElementById('atSign');
      mover.classList.add("bounce");
      if (!this.closeClicked) {
          this.closeAtSign = setInterval(() => {
              this.refreshAtSign();
          }, (Math.floor(Math.random() * 20) + 6) * 1000)
      }
  }

    scroll(el: HTMLElement, height) {
        var node = el;
        var yourHeight = height;

        node.scrollIntoView(true);
        node.focus()

        var scrolledY = window.scrollY;

        if(scrolledY){
        window.scroll({ top: scrolledY - yourHeight, behavior: "smooth" });
        }
        document.querySelector('.navbar.fixed-top').classList.add("scrolled");
        document.getElementById('email').focus();
    }
    @HostListener("window:scroll", ['$event'])
    scrollMe(event) {

       if(window.scrollY > 200){
           document.querySelector('.navbar.fixed-top').classList.add("scrolled");
       }else{
        document.querySelector('.navbar.fixed-top').classList.remove("scrolled");           
       }
        
    }
    
    checkValidEmail(email) {
        this.invalidEmail = false;
        let result = this.utilityService.checkEmailValid(email);
        if (!(result)) {
            this.invalidEmail = true;
        }
    }
    async getInviteCode(form: NgForm) {
        this.inviteSend = false;
        this.showErrorMessage = '';
        this.serverErrorMessages = '';
        this.showSucessMessage = false;
        this.activeUser = false;
        
        this.checkValidEmail(form.value.email)
        if (!this.invalidEmail) {
            if (form.value.email) {
                // let validAtsign = await this.checkValidAtSign(form.value.atsign);
                // if (validAtsign) {
                    this.userService.getInviteCode(form.value).subscribe(
                        res => {
                            if (res['status'] === 'success') {
                                this.showSucessMessage = true;
                                this.inviteSend = true;
                                this.model['email'] = '';
                                this.model['atsign'] = '';
                                this.showErrorMessage = '';
                            } else {
                                this.showSucessMessage = false;

                                if (res['data'] && res['data']['user_status'] === 'Active') {
                                    this.activeUser = true;
                                    this.userService.homeEmail = form.value.email;
                                }
                                else {
                                    this.showErrorMessage = res['message'];
                                }
                            }
                        },
                        err => {
                            this.serverErrorMessages = 'Something went wrong. Please contact admin.';
                        }
                    );
                // } else {
                //     this.showErrorMessage = 'Oops, you entered incorrect invite code.';
                // }
            }
        }
    }
    checkValidAtSign(atsign) {
        return new Promise((resolve, reject) => {
            if (atsign) {
                this.userService.checkValidAtsign({ atsign: atsign }).subscribe(
                    res => {
                        if (res['status'] === 'success') {
                            this.atSignInvite = true;
                            resolve(true);
                        } else {
                            this.atSignInvite = false;
                            resolve(false);
                        }
                    },
                    err => {
                        resolve(false);
                        this.serverErrorMessages = 'Something went wrong. Please contact admin.';
                    }
                    );
                } else {
                    this.atSignInvite = false;
                    resolve(true);
            }
        })
    }
    onLogout() {
      this.userService.deleteToken();
      if (this.isAdmin || this.isAdminReport) {
          this.router.navigate(['/login/admin']);
      } else {
          this.router.navigate(['/login']);
      }
  }
}
