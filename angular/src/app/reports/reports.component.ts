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
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { environment } from '../../environments/environment';
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
import { merge, fromEvent } from "rxjs";
export interface UserData { }
@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css']
})

export class ReportsComponent implements OnInit {
    faUserPlus = faUserPlus;
    faHistory = faHistory;
    faTrash = faTrash;
    allUsers: UserData[] = [];
    csvData: any;
    showSucessMessage: boolean;
    serverErrorMessages: string;
    dataSource: MatTableDataSource<UserData>;
    tomorrow: Date;
    model: any = {
        atsignType: '',
        fromDate: '',
        toDate: ''
    }
    displayedColumns: string[] = ['id', 'atsignName', 'email', 'contact', 'userStatus', 'payAmount', 'premiumAtsignType', 'atsignCreatedOn'];
    formValidation: boolean = false;
    handleNotAvailable: boolean = false;
    showErrorMessage: string = '';
    invalidEmail: boolean = false;
    atsignTypes: any;
    downloadUrl: string;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    
    public pieChartOptions: ChartOptions = {
      responsive: true,
    };
    public pieChartLabels: Label[] = [];
    public pieChartData: SingleDataSet = [];
    public pieChartType: ChartType = 'pie';
    public backgroundColors = [{backgroundColor: ["#d94d1a", "#00a388", "#434a54", "#3ebf9b", "#4d86dc", "#f3af37"]}];
    public pieChartLegend = true;
    public pieChartPlugins = [];
    totatData: Number = 0;
  
    constructor(private userService: UserService, private router: Router, private _snackBar: MatSnackBar,
        private SpinnerService: NgxSpinnerService, public dialog: MatDialog) {
        this.atsignTypes = [
            { value: 'all', viewValue: 'All @signs' },
            { value: 'all-free', viewValue: 'All free @signs' },
            { value: 'all-paid', viewValue: 'All paid @signs' },
            { value: 'all-reserved', viewValue: 'All reserved @signs' },
            { value: 'all-custom', viewValue: 'All custom @signs' },
            { value: 'all-single', viewValue: 'All single word @signs' },
            { value: 'all-three', viewValue: 'All 3 letter @signs' },
            { value: 'all-users', viewValue: 'All active users' },
            { value: 'all-paid-users', viewValue: 'All active paid users' },
            { value: 'all-free-users', viewValue: 'All active free users' },
            { value: 'all-user-email-noti-enabled', viewValue: 'All users - Email notification enabled' },
            { value: 'all-invite', viewValue: 'All invited users - didn\'t get @signs' },//reserved emails invited state
            { value: 'friend-invite', viewValue : 'All friend invites'},
            { value: 'referred-by', viewValue : 'All home referral'},
            // { value: 'promo-code', viewValue : 'Giftup Promocode'},
            { value: 'all-10', viewValue : 'All 10$ '},
            { value: 'all-100', viewValue : 'All 100$'},
            { value: 'all-1000', viewValue : 'All 1000$'},
            { value: 'all-5000', viewValue : 'All 5000$'},
            { value: 'commercial-atsign', viewValue : 'Commercial Atsign'}
        ];

        var date = new Date(), y = date.getFullYear(), m = date.getMonth();
        this.model.fromDate = new Date(y, m, 1);
        this.model.toDate = date;
        this.model.atsignType = 'all';
        this.userService.currentUserType = 'admin';
        this.tomorrow = new Date(); 
        this.tomorrow.setDate(this.tomorrow.getDate() + 1);
        monkeyPatchChartJsTooltip();
        monkeyPatchChartJsLegend();
    }

getViewValueFromKey(key)
{
    for(let i=0; i<this.atsignTypes.length; i++)
    {
        if(this.atsignTypes[i].value === key)
        {
            return this.atsignTypes[i].viewValue;
            
        }
    }
}
    ngOnInit() { 
    }
    ngAfterViewInit() {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => {
                    let data = {
                        pageNo: this.paginator.pageIndex + 1,
                        pageSize: this.paginator.pageSize,
                        sortBy: this.sort.active ? this.sort.active : 'atsignCreatedOn',
                        sortOrder: this.sort.direction ? this.sort.direction : 'desc'
                    }
                    this.searchAtsign(data)
                    // this.loadLessonsPage();
                })
            )
            .subscribe();
    }

    onLogout() {
        this.userService.deleteToken();
        this.router.navigate(['/login']);
    }
    searchAtsign(data) {
        if(!data){
             data = {
                pageNo: this.paginator.pageIndex + 1,
                pageSize: this.paginator.pageSize,
                sortBy: this.sort.active ? this.sort.active : 'atsignCreatedOn',
                sortOrder: this.sort.direction ? this.sort.direction : 'desc'
            }
        }
        if (this.model.atsignType && this.model.fromDate && this.model.toDate) {
            this.pieChartLabels = [];
            this.pieChartData = [];
            this.showErrorMessage = '';
            this.SpinnerService.show();
            this.formValidation = false;
            this.model.fromDate = new Date(this.model.fromDate);
            this.model.toDate = new Date(this.model.toDate)
            data['atsignType'] = this.model.atsignType;
            data['fromDate'] = this.model.fromDate;
            data['toDate'] = this.model.toDate;
            this.userService.getUsersForReport(data,false).subscribe(
                res => {
                    this.totatData = res['totalData'];
                    this.allUsers = res['csvData']['rows'];
                    if (this.allUsers.length === 0) {
                        this.showErrorMessage = 'No records found.';
                    }
                    this.csvData = res['csvData'];
                    this.dataSource = new MatTableDataSource(this.allUsers);
                    // this.dataSource.paginator = this.paginator;
                    // this.dataSource.sort = this.sort;
                    this.displayedColumns = ['id', 'atsignName', 'email', 'contact', 'payAmount', 'premiumAtsignType', 'atsignCreatedOn'];
                    if(this.model.atsignType === 'all-users'){
                        this.displayedColumns = ['id', 'email', 'contact', 'userStatus', 'atsignCreatedOn','freeAtsignCount', 'paidAtsignCount', 'totalAtsignCount'];
                        this.pieChartLabels = ['Paid', 'Free'];
                        this.pieChartData = [res['pieData'].paid, res['pieData'].free];
                    } else if(this.model.atsignType === 'all-invite'){
                        this.displayedColumns = ['id', 'email', 'contact', 'userStatus', 'atsignType', 'atsignCreatedOn'];
                    } else if(this.model.atsignType === 'all-paid-users' || this.model.atsignType === 'all-free-users' || this.model.atsignType === 'all-user-email-noti-enabled'){
                        this.displayedColumns = ['id', 'email', 'contact', 'userStatus', 'atsignCreatedOn','freeAtsignCount', 'paidAtsignCount', 'totalAtsignCount'];
                    }else if(this.model.atsignType === 'friend-invite'){
                        this.displayedColumns = ['id', 'email', 'contact','freeAtsignCount', 'paidAtsignCount', 'totalAtsignCount','activeCount','inactiveCount', 'invitedCount'];
                    }else if(this.model.atsignType === 'referred-by'){
                        this.displayedColumns = ['id', 'email', 'contact','atsignName','freeAtsignCount', 'paidAtsignCount', 'totalAtsignCount','activeCount','inactiveCount', 'invitedCount'];
                    }else if(this.model.atsignType === 'promo-code'){
                        this.displayedColumns = ['id','promocode', 'email', 'atsignName','atsignCreatedOn','amount', 'promocodeAmount'];
                    }else if(this.model.atsignType === 'commercial-atsign'){
                        this.displayedColumns = ['id','commercialAtsign', 'email', 'atsignName','payAmount','atsignCreatedOn'];
                    }
                    this.SpinnerService.hide();
                },
                err => {
                    this.allUsers = [];
                    this.totatData = 0;
                    this.SpinnerService.hide();
                    if (err.error.message === 'No records found.') {
                        this.showErrorMessage = err.error.message;
                    }
                    //console.log(err);
                    if (err.error.message === "Unauthorized") {
                        this.router.navigateByUrl('/login');
                    }
                }
            );
        } else {
            this.formValidation = true;
        }
    }

    downloadFile(data: any) {
        const blob = new Blob([data.body], { type: 'text/csv' });
        const element = document.createElement('a');
        element.href = URL.createObjectURL(blob);
        element.download = data.headers.get('file-name');
        document.body.appendChild(element);
        element.click();
    }
    exportCsv() {
        let requestData = { ...this.model };
        requestData['csv'] = "all";
        requestData['sortBy'] = this.sort.active ? this.sort.active : 'atsignCreatedOn';
        this.userService.getUsersForReport(requestData, true).subscribe(
            res => this.downloadFile(res),
            err => {
                if (err.error.message === 'No records found.') {
                    this.showErrorMessage = err.error.message;
                }
                if (err.error.message === "Unauthorized") {
                    this.router.navigateByUrl('/login');
                }
            }
        );
    }

}