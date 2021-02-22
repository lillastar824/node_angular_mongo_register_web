import { Component, OnInit, Inject } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import {ModalDialogComponent} from './../modal-dialog/modal-dialog.component';
import { Router } from "@angular/router";
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
    userDetails;
    email: string;
    showSucessMessage: boolean;
    serverErrorMessages: string;
    constructor(public userService: UserService, private router: Router, public dialog: MatDialog) { }
    openDialog(type): void {
        this.email = '';
        const dialogRef = this.dialog.open(ModalDialogComponent, {
            width: '250px',
            data: { email: this.email, userDetails: this.userDetails },
        });
        dialogRef.afterClosed().subscribe(result => {
            //console.log('The dialog was closed');
            this.email = result;
        });
    }

    ngOnInit() {
        this.userService.getUserProfile().subscribe(
            res => {
                this.userDetails = res['user'];
                if(this.userDetails['atsignName']){
                var oneYearFromNow = new Date(res['user']['atsignCreatedOn']);
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                this.userDetails['renewTime'] = new Date(oneYearFromNow);
                }
            },
            err => {
                //console.log(err);

            }
        );
    }

    onLogout() {
        this.userService.deleteToken();
        this.router.navigate(['/login']);
    }
    cancelSubscription() {
        this.userService.cancelSubscription({contact:this.userDetails['contact']}).subscribe(
            res => {
                    this.showSucessMessage = true;
                    this.userDetails['atsignName']='';
                    this.userDetails['atsignType']='';
                    this.userDetails['atsignCreatedOn']='';
                    this.userDetails['renewTime']='';
                    setTimeout(() => this.showSucessMessage = false, 4000);
                    // this.resetForm(form);
                },
                err => {
                    if (err.status === 422) {
                        this.serverErrorMessages = err.error.join('<br/>');
                    }
                    else
                        this.serverErrorMessages = 'Something went wrong.Please contact admin.';
                }
        );
    }

}