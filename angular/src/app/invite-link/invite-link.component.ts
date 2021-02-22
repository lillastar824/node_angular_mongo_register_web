import { Component, OnInit, Inject, Input } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { Router } from "@angular/router";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { NgForm } from '@angular/forms';
import { UtilityService } from '../shared/services/utility.service'
import {InviteHistoryDialogComponent} from '../invite-history-dialog/invite-history-dialog.component'
import { InviteShareableLinkDialogComponent } from '../invite-shareable-link-dialog/invite-shareable-link-dialog.component';

export interface DialogData {
    email: string;
}
@Component({
    selector: 'app-invite-link',
    templateUrl: './invite-link.component.html',
    styleUrls: ['./invite-link.component.css']
})

export class InviteLinkComponent {

    inviteLink: any;
    showSucessMessage: boolean;
    serverErrorMessages: string;
    usedCode: number = 0;
    unusedCode: number = 0;
    faCopy = faCopy;
    model: any = {
        email: '',
        from: '',
        personalNote: '',
        sendCopy: false,
        atsignName: ''
    };
    showInviteScreen: boolean = true;
    showPreviewScreen: boolean = false;
    showInviteSentScreen: boolean = false;
    invalidEmail: boolean = false;
    formValidation: boolean = false;
    showServerError: string = '';

    presonalNote: string = "Hey, have you heard of the @sign? It’s a unique online identifier (i.e. @alice) that will help you reclaim your digital privacy and take ownership of your data. Soon, you’ll be able to use it with a lot of super fun mobile apps. \n\n I just got mine — you should consider getting one before the good ones are taken. Here’s my personal link. I think it’s going to blow up! \n\n - "



    personalNotePreview : string ="";
    selectedTab: string = 'invite';
    inviteData:any = []
    invalidName: boolean;
    constructor(private userService: UserService,
        public dialogRef: MatDialogRef<InviteLinkComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private _snackBar: MatSnackBar,private utilityService : UtilityService,
        private router: Router, public dialog: MatDialog) { }

    onNoClick(): void {
        this.dialogRef.close();
        this.dialogRef.close({ event: 'Closed', data: this.data});
    }

    ngOnInit() {
        this.model.personalNote = this.presonalNote;
        this.getInviteHistory();
        this.data['totalInvite'] = 0
    }
    checkValidEmail(email) {
        this.invalidEmail = false;
        this.formValidation = false;
        let result = this.utilityService.checkEmailValid(email);
        if (!(result)) {
            this.invalidEmail = true;
        } else {
            this.updatePersonalNote();
        }
    }
    checkValidName(from){
        this.invalidName = false;
        this.formValidation = false;
        let result = this.utilityService.checkNameValid(from);
        if(!(result)){
            this.invalidName = true;        
        }
        else{
        this.invalidName = false;
        }
    }
    // copyInviteLink() {
    //     this.userService.createInvites("").subscribe(
    //         res => {
    //             if (res['status'] === 'success') {
    //                 this.inviteLink = res['inviteLink'];
    //                 this.copyInputMessage(this.inviteLink);
    //                 this.data['inviteLeft'] -= 1;
    //                 this.inviteData.push({
    //                     inviteLink: this.inviteLink,
    //                     sentOn: new Date()
    //                 });
    //             } else {
    //                 this.showServerError = res['message']
    //             }
    //         },
    //         err => {
    //             //console.log(err);
    //             if (err.error.message === "Unauthorized") {
    //                 this.onNoClick();
    //                 this.router.navigateByUrl('/login');
    //             }
    //         }
    //     );
    // }
    // copyInputMessage(inputElement) {
    //     let selBox = document.createElement('textarea');
    //     selBox.style.position = 'fixed';
    //     selBox.style.left = '0';
    //     selBox.style.top = '0';
    //     selBox.style.opacity = '0';
    //     selBox.value = inputElement;
    //     document.body.appendChild(selBox);
    //     selBox.focus();
    //     selBox.select();
    //     document.execCommand('copy');
    //     document.body.removeChild(selBox);
    //     this._snackBar.open('Invite link copied to clipboard', 'x', {
    //         duration: 15000,
    //         panelClass: ['custom-snackbar']
    //     });
    // }
    sendInvite(form: NgForm) {
        //console.log(this.model);
        if (this.model.from && this.model.email && !this.invalidEmail && !this.invalidName) {
            this.formValidation = false;
            this.model.email = this.model.email.toLowerCase();
            this.userService.createFriendUser({ email: this.model.email, from: this.model.from, personalNote: this.model.personalNote, sendCopy: this.model.sendCopy }).subscribe(
                res => {
                    if (res['status'] === 'success') {
                        this.showInviteSentScreen = true;
                        this.showInviteScreen = false;
                        this.showPreviewScreen = false;
                        this.data['inviteLeft'] -= 1;
                        this.data['totalInvite'] += 1;
                        this.inviteData.push({
                            email: this.model.email,
                            sentOn: new Date()
                        })
                    } else {
                        this.showServerError = res['message']
                    }
                },
                err => {
                    //console.log(err);
                    if (err.error.message === "Unauthorized") {
                        this.onNoClick();
                        this.router.navigateByUrl('/login');
                    }
                }
            );
        } else {
            this.formValidation = true;
        }
    }
    showPreview() {
        if (this.model.from && this.model.email && !this.invalidEmail && !this.invalidName) {
            this.formValidation = false;
            this.showInviteScreen = false;
            this.showPreviewScreen = true;
            this.showInviteSentScreen = false;
            this.selectedTab = 'invite';
            this.personalNotePreview = this.utilityService.nltobr(this.model.personalNote);
        } else {
            this.formValidation = true;
        }
    }
    updatePersonalNote() {
       // this.checkValidName(this.model.from);
        this.formValidation = false;
        this.model.personalNote = 'Hey '+ this.model.email + ', have you heard of the @sign? It’s a unique online identifier (i.e. @alice) that will help you reclaim your digital privacy and take ownership of your data. Soon, you’ll be able to use it with a lot of super fun mobile apps. \n\n I just got mine — you should consider getting one before the good ones are taken. Here’s my personal link. I think it’s going to blow up! \n\n - ' + this.model.from;
    }
    sendAnotherInvite() {
        this.model = {
            email: '',
            from: '',
            personalNote: this.presonalNote,
            sendCopy: false
        }
        this.showInviteScreen = true;
        this.showPreviewScreen = false;
        this.showInviteSentScreen = false;
        this.showServerError = '';
        this.selectedTab = 'invite';
    }
    getInviteHistory() {
        this.userService.getInviteHistory().subscribe(
            res => {
                if (res['status'] === 'success') {
                    this.inviteData = res['data'];
                    this.model.atsignName = res['atsignName']
                }
            },
            err => {
                //console.log(err);
            }
        );
    }
    openInviteHistoryDialog(){
      this.dialog.open(InviteHistoryDialogComponent,{
        backdropClass: 'dark-overlay-backdrop',
        panelClass: ['top-center-panel', 'invite-history-panel'],
        width: '445px',
        data: {inviteData: this.inviteData}
      });
    }
    
    openShareableLinkDialog(){
        this.dialog.open(InviteShareableLinkDialogComponent,{
          backdropClass: 'dark-overlay-backdrop',
          panelClass: ['top-center-panel', 'invite-history-panel'],
          width: '445px',
          data: {inviteData: this.inviteData}
        });
      }
}
