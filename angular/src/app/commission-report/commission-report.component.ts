import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { Router } from "@angular/router";
import { faEdit, faCheck } from '@fortawesome/free-solid-svg-icons';
import { MatTableDataSource } from '@angular/material';
import { MatSort } from '@angular/material/sort';
import { NgForm } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilityService } from '../shared/services/utility.service';
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
import { merge, fromEvent } from "rxjs";
import { CommissionAtsignApproveComponent } from '../user/commission-atsign-approve/commission-atsign-approve.component';

export interface atsignData { }

@Component({
  selector: 'app-commission-report',
  templateUrl: './commission-report.component.html',
  styleUrls: ['./commission-report.component.css']
})
export class CommissionReportComponent implements OnInit {
    faCheck = faCheck;
    faEdit = faEdit;
    allAtsigns: any;
    showSucessMessage: boolean;
    serverErrorMessages: string;
    dataSource: MatTableDataSource<atsignData>;
    model: any = {
        atsign: '',
        commissionPercentage: '',
        discountOfferedPercentage: '',
    };
    displayedColumns: string[] = ['id', 'name', 'totalOrderAmount', 'totalCommissionPaid', 'totalFinalCommission', 'status', 'currency','approve'];
    formValidation: boolean = false;
    showErrorMessage: string;
    showSuccessMessage: string;
    isEdit: any = [];
    sortedData: any = [];
    showEmptyErrorMessage: string;
    disableAll: boolean = false;
    pageEvent: any;
    atsignType: string = 'Custom';
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    createAtsignId: any;
    dataSise: any;
    @HostListener('matSortChange', ['$event'])
    sortChange(e) {
    }
    @ViewChild('input', { static: false }) input: ElementRef;
    totatData: Number = 0;

    constructor(private userService: UserService, private router: Router, private _snackBar: MatSnackBar,
        private SpinnerService: NgxSpinnerService, public dialog: MatDialog, private utilityService: UtilityService) {
    }

    ngOnInit() {
        let data = {
            pageNo: 1,
            limit: 25,
            sortBy: 'name',
            sortOrder: 'asc',
            searchTerm: '',
            atsignType: 'Custom'
        }
        this.getAllCommissionReports(data);
    }
    ngAfterViewInit() {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        //searching
        fromEvent(this.input.nativeElement, 'keyup')
            .pipe(
                debounceTime(150),
                distinctUntilChanged(),
                tap(() => {
                    this.paginator.pageIndex = 0;
                    let data = {
                        pageNo: this.paginator.pageIndex + 1,
                        limit: this.paginator.pageSize,
                        sortBy: this.sort.active ? this.sort.active : 'invitedOn',
                        sortOrder: this.sort.direction ? this.sort.direction : 'desc',
                        searchTerm: this.input.nativeElement.value ? this.input.nativeElement.value : '',
                        atsignType: this.atsignType
                    }
                    this.getAllCommissionReports(data)
                    // this.loadLessonsPage();
                })
            )
            .subscribe();

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => {
                    let data = {
                        pageNo: this.paginator.pageIndex + 1,
                        limit: this.paginator.pageSize,
                        sortBy: this.sort.active ? this.sort.active : 'name',
                        sortOrder: this.sort.direction ? this.sort.direction : 'asc',
                        searchTerm: this.input.nativeElement.value ? this.input.nativeElement.value : '',
                        atsignType: this.atsignType
                    }
                    this.getAllCommissionReports(data)
                    // this.loadLessonsPage();
                })
            )
            .subscribe();

    }

    getAllCommissionReports(data) {
        if (!data) {
            data = {
                pageNo: this.paginator.pageIndex + 1,
                limit: this.paginator.pageSize,
                sortBy: this.sort.active ? this.sort.active : 'name',
                sortOrder: this.sort.direction ? this.sort.direction : 'asc',
                searchTerm: this.input.nativeElement.value ? this.input.nativeElement.value : '',
                atsignType: this.atsignType
            }

        }
        this.SpinnerService.show();
        this.userService.getAllCommissionReports(data).subscribe(
            res => {
                this.allAtsigns = res['data'] && res['data']['records'] ? res['data']['records'] : [];
                this.totatData = res['data'] && res['data']['total'] ? res['data']['total'] : 0;
                this.dataSise = res['data'] && res['data']['records'].length <= 0;
                this.dataSource = new MatTableDataSource(this.allAtsigns);
                this.SpinnerService.hide();
                this.userService.currentUserType = 'admin';
            },
            err => {
                if (err.error.message === "Unauthorized") {
                    this.router.navigateByUrl('/login');
                }
            }
        );
    }

    sortData(e) {
        if (e.direction !== '') {
            this.dataSource.connect().subscribe(d => {
                this.sortedData = d;
            });
        } else {
            this.sortedData = [];
        }
        this.isEdit = [];
    }
    onLogout() {
        this.userService.deleteToken();
        this.router.navigate(['/login']);
    }
 
    onPaginateChange(e) {
        this.isEdit = [];
    }

    // approveCommission(atsign){
    //     this.userService.approveCommission(atsign).subscribe(res => {
    //         this.allAtsigns = res['data'] && res['data']['records'] ? res['data']['records'] : [];
    //         this.totatData = res['data'] && res['data']['total'] ? res['data']['total'] : 0;
    //         this.dataSource = new MatTableDataSource(this.allAtsigns);
    //         this.SpinnerService.hide();
    //         this.userService.currentUserType = 'admin';
    //     },
    //     err => {
    //         if (err.error.message === "Unauthorized") {
    //             this.router.navigateByUrl('/login');
    //         }
    //     })
    // }
 

    approveCommission(atsign): void {
        const dialogRef = this.dialog.open(CommissionAtsignApproveComponent, {
            width: '500px',
            data: atsign
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.event === 'successfully') {
                this.SpinnerService.hide();
                this.ngOnInit()
            }
        });
    }
}

