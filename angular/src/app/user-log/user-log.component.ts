import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { Router } from "@angular/router";
import { faUserPlus, faHistory, faTrash } from '@fortawesome/free-solid-svg-icons';
import { MatTableDataSource } from '@angular/material';
import { MatSort } from '@angular/material/sort';
import { NgForm } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { UtilityService } from '../shared/services/utility.service';
import { DeviceDetectorService } from 'ngx-device-detector';

export interface UserData { }

@Component({
    selector: 'app-user-log',
    templateUrl: './user-log.component.html',
    styleUrls: ['./user-log.component.css']
})
export class UserLogComponent implements OnInit {
    faUserPlus = faUserPlus;
    faHistory = faHistory;
    faTrash = faTrash;
    allUsers: UserData[] = [];
    csvData: any;
    showSucessMessage: boolean;
    serverErrorMessages: string;
    dataSource: MatTableDataSource<UserData>;

    model: any = {
        email: '',
        contact: '',
        type: 'email',
        fromDate: '',
        toDate: ''
    }
    displayedColumns: string[] = ['id','url','method', 'body', 'referer', 'userAgent', 'createdOn'];
    formValidation: boolean = false;
    showErrorMessage: string = '';
    invalidEmail: string = '';
    atsignTypes: any;
    Object = Object;
    deviceInfo: any;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(private userService: UserService, private router: Router, private _snackBar: MatSnackBar,
        private SpinnerService: NgxSpinnerService, public dialog: MatDialog,
        private utilityService: UtilityService, private deviceService: DeviceDetectorService) {
            var date = new Date(), y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
            this.model.fromDate = new Date(y, m, d-1);
            this.model.toDate = date;
    }

    ngOnInit() {
    }
    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

    onLogout() {
        this.userService.deleteToken();
        this.router.navigate(['/login']);
    }
    checkValidEmail(email) {
        //console.log(email)
        this.showErrorMessage = '';
        this.invalidEmail = '';
        this.formValidation = false;
        let result = this.utilityService.checkEmailValid(email);
        if (!result) {
            this.invalidEmail = 'Enter a valid email address';
        }
    }
    checkValidMobile(contact) {
        //console.log(contact)
        this.showErrorMessage = '';
        this.invalidEmail = '';
        this.formValidation = false;
        let result = this.utilityService.checkMobileValid(contact);
        if (!result) {
            this.invalidEmail = 'Enter a valid contact number';
        }
    }
    fetchUser() {
        //console.log(this.model)
        this.showErrorMessage = '';
        // if (this.model.email || this.model.contact) 
        {
            if (!this.invalidEmail) {
                this.SpinnerService.show();
                this.formValidation = false;
                //console.log("vsv")
                this.userService.fetchUserLog(this.model).subscribe(
                    res => {
                        if(res['status'] === 'error')
                        {
                            this.SpinnerService.hide();
                            this.showErrorMessage = res['message'];
                            return;
                        }
                        for(let i = 0;i<res['logs'].length; i++){
                            // res['logs'][i].body = JSON.parse(res['logs'][i].body);
                            this.deviceService.setDeviceInfo(res['logs'][i].userAgent);
                            res['logs'][i].userAgent = this.deviceService.getDeviceInfo();
                            delete res['logs'][i].userAgent['userAgent'];
                        }
                        this.allUsers = res['logs'];
                        // this.csvData = res['csvData'];
                        this.dataSource = new MatTableDataSource(this.allUsers);
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort;
                        this.SpinnerService.hide();
                    },
                    err => {
                        this.SpinnerService.hide();
                        //console.log(err);
                        this.showErrorMessage = err.message;
                        if (err.error.message === "Unauthorized") {
                            this.router.navigateByUrl('/login');
                        }
                    }
                );
            }
        } 
        // else {
        //     this.formValidation = true;
        // }
    }
}
