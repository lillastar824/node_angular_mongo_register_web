import { Component, OnInit } from '@angular/core';
import { Routes, RouterModule, Router, ActivatedRoute } from "@angular/router";
import { UserService } from '../shared/services/user.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {InviteLinkComponent} from '../invite-link/invite-link.component'
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { ActivateAtsignComponent } from '../activate-atsign/activate-atsign.component';
import {UtilityService} from '../shared/services/utility.service';
import {ProductInfoComponent } from '../product-info/product-info.component'
import {PurchasedSignsModalComponent } from '../purchased-signs-modal/purchased-signs-modal.component';
import { PurchaseHistoryDialogComponent } from '../purchase-history-dialog/purchase-history-dialog.component';
import { VerificationMethodsDialogComponent } from '../verification-methods-dialog/verification-methods-dialog.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationsService } from '../shared/notifications.service';
// import { SendGiftCardComponent } from '../send-gift-card/send-gift-card.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

    userDetails: any = {email:"", inviteCode:"", atsignDetails:[]};

    email: string = "";
    detailIndex: number = 0;
    showSucessMessage: boolean = false;
    inviteLeft: number;
    payNowLink: string = "";

    freeAtSigns: [] = [];
    paidAtSigns: [] = [];
    totalFriendCount: number;
    emailVerified: boolean = false;
    contactVerified: boolean = false;
    showLists: boolean = false;
    unreadNotifications : any[] = []
    transferredAtsigns : any = []
    verifyUserContact: boolean = false;
    constructor(private userService: UserService,
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        private utilityService : UtilityService,
        private SpinnerService: NgxSpinnerService,
        private notificationService: NotificationsService) {
        this.SpinnerService.show();
        this.userService.getUserProfile().subscribe(
            res => {
                this.userDetails = res['user'];
                this.showLists =  true;
                this.totalFriendCount = this.userDetails.inviteFriendDetails.length;
                this.userService.selectHandle.email = this.userDetails.email;
                this.userService.selectHandle.contact = this.userDetails.contact;
                this.emailVerified = this.userDetails.email ? true : false;
                this.contactVerified = this.userDetails.contact ? true : false;
                let handles = this.userDetails['atsignDetails'];
                this.userService.currentUserType = 'user';
                const inviteLeft = 500 - this.userDetails['inviteFriendDetails'].length;
                this.inviteLeft = inviteLeft > 0 ? inviteLeft : 0;
                handles.forEach(function(value, key) {
                    if(!value['atsignName']){
                        handles.splice(key, 1);
                    }
                    if(value['isActivated'] == 1)
                    {
                      value['isActivated'] = 2;
                    }
                    // this.isActivating.push(false);
                    if(value['atsignCreatedOn']){
                        var oneYearFromNow = new Date(value['atsignCreatedOn']);
                        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                        value['renewDate'] = new Date(oneYearFromNow).toLocaleString('default', { month: 'long' }) + ' ' + new Date(oneYearFromNow).getDate() + ', ' + new Date(oneYearFromNow).getFullYear();
                    }
                    else{
                        //console.log(value);
                        value['payNow']= value['inviteLink'];
                        value['verifyLink'] = "/account-verify//" + value['inviteCode'];
                    }

                  });
                  var groupedAtsigns = this.groupBy(this.userDetails['atsignDetails'], 'atsignType'); // => {orange:[...], banana:[...]}
                  this.freeAtSigns =groupedAtsigns.free;
                  this.paidAtSigns =groupedAtsigns.paid;
                  this.userService.createNewHande(this.userDetails.email,this.userDetails.contact)
                  this.SpinnerService.hide();
                  let state = window.history.state;
                  if(state) {
                    this.verifyUserContact = state.verifyUserContact;
                    if(this.verifyUserContact) {
                      if((this.userDetails['atsignDetails'].length > 0) && (!this.userDetails.email || !this.userDetails.contact)) {
                        this.openVerificationMethodsDialog()
                      }
                    }
                  }
            },
            err => {
                //console.log(err);
                this.SpinnerService.hide();
            }
        );
        
          this.userService.atsignTransferList({}).subscribe(  res => {
            if (res['status'] === 'success') {
              this.transferredAtsigns = res["data"]["records"];
            }
          },
          err => {
            //console.log(err);
          })
      
        
        if(this.userService.selectHandle['handleType'] === "paid"){
        this.userService.checkPaidUser(this.userService.selectHandle['atsignName']).subscribe(
            res => {
                if (res['message'] === "not paid") {
                    this.userDetails['atsignDetails'].forEach((value, key) => {
                        if (value['atsignName']) {
                            this.router.navigateByUrl('/checkout/' + value['inviteCode']);
                        }
                    });
                }
            }
        );
      }

      this.fetchUnreadnotification();
    }

    groupBy(arr, property) {
        return arr.reduce(function(data, x) {
          if (!data[x[property]]) { data[x[property]] = []; }
          data[x[property]].push(x);
          return data;
        }, {});
      }

    ngOnInit() {
     this.userService.selectHandle.email = this.userDetails['email'];
     this.userService.selectHandle.contact = this.userDetails['contact'];
    }

    createAnotherSign() {
    this.userService.createAnotherSign(this.userDetails['email'],this.userDetails['contact']);
    }

    openDialog(type): void {
        if(type== 'purchased-signs'){
          this.dialog.open(PurchasedSignsModalComponent,{
            panelClass: 'fullscreen-dialog-panel',
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            data: {
                freeAtSigns: this.freeAtSigns,
                paidAtSigns: this.paidAtSigns,
                atSigns : this.userDetails['atsignDetails']
            }
          });
        } else{
          const dialogRef = this.dialog.open(InviteLinkComponent, {
            panelClass: 'fullscreen-dialog-panel',
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            data: { inviteLeft: this.inviteLeft}
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this.totalFriendCount += result.data.totalInvite;
                this.inviteLeft = result.data.inviteLeft;
            }
        });
        }

    }


    openNotificationsDialog(){
      const dialogRef = this.dialog.open(ProductInfoComponent,{
        panelClass: 'fullscreen-dialog-panel',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        data: {
          productNotificationEmail: this.userDetails.productNotificationEmail,
          productNotificationMobile: this.userDetails.productNotificationMobile,
          contact: this.userDetails.contact
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result && result.data) {
          this.userDetails.productNotificationEmail =
            result.data.productNotificationEmail;
          this.userDetails.productNotificationMobile =
            result.data.productNotificationMobile;
        }
        if(result && result.event === "RENEWAL") {
          this.openDialog('purchased-signs');
        }
        this.fetchUnreadnotification();
      });
    }

    openPurchaseHistoryDialog(){
      this.dialog.open(PurchaseHistoryDialogComponent,{
        panelClass: 'fullscreen-dialog-panel',
        width: '100%',
        height: '100%',
        maxWidth: '100%'
      });
    }
    openSendGiftCardDialog(){
      this.router.navigateByUrl('/gift-up-card');
      // this.dialog.open(SendGiftCardComponent,{
      //   panelClass: 'fullscreen-dialog-panel',
      //   width: '100%',
      //   height: '100%',
      //   maxWidth: '100%'
      // });
    }
    openVerificationMethodsDialog(){
      let dialogRef = this.dialog.open(VerificationMethodsDialogComponent,{
        panelClass: 'fullscreen-dialog-panel',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        data: {
          email: this.userDetails.email,
          emailVerified: this.emailVerified,
          contact: this.userDetails.contact && this.userDetails.contact.split(' ')[1],
          countryCode: this.userDetails.contact && this.userDetails.contact.split(' ')[0],
          contactVerified: this.contactVerified,
          combinedContactNumber: this.userDetails.contact
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        this.userDetails['email'] = this.userService.selectHandle.email;
        this.userDetails['contact'] = this.userService.selectHandle.contact;
      });

    }
    saveProductNotification(name, value) {
      let data = {};
      data['email'] = this.userDetails['email'];
      data[name] = value.checked;
      data['name'] = name;
      this.userDetails[name] = value.checked;
      this.userService.saveProductNotification(data).subscribe(
          res => {
          },
          err => {
              //console.log(err);
          }
      );
  }

  fetchUnreadnotification() {
    this.notificationService.getUnreadNotifications().subscribe((notifications : any[]) => {
      this.unreadNotifications = notifications
    })
  }
}
