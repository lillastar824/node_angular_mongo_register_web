import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { Router } from "@angular/router";
import { faEdit, faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { MatTableDataSource } from '@angular/material';
import { MatSort } from '@angular/material/sort';
import { NgForm } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../../confirmation-modal/confirmation-modal.component';
import { UtilityService } from '../../shared/services/utility.service';
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
import { merge, fromEvent } from "rxjs";
import { CommissionAtsignModelComponent } from '../commission-atsign-model/commission-atsign-model.component';
import { HelpComponent } from './help/help.component';

export interface atsignData { }

@Component({
    selector: 'app-commission-atsign',
    templateUrl: './commission-atsign.component.html',
    styleUrls: ['./commission-atsign.component.css']
})
export class CommissionAtsignComponent implements OnInit {
    faTrash = faTrash;
    faEdit = faEdit;
    faInfoCircle = faInfoCircle;
    allAtsigns: any = [];
    showSucessMessage: boolean;
    serverErrorMessages: string;
    dataSource: MatTableDataSource<atsignData>;
    model: any = {
        atsign: '',
        commissionPercentage: '',
        discountOfferedPercentage: '',
        maxDiscountAmount: ''
    };
    // Commission todo
    displayedColumns: string[] = ['id', 'atsign', 'commissionPercentage', 'discountOfferedPercentage', 'maxDiscountAmount', 'edit', 'delete'];
    // displayedColumns: string[] = ['id', 'atsign', 'commissionPercentage', 'edit', 'delete'];
    formValidation: boolean = false;
    showErrorMessage: string;
    showSuccessMessage: string;
    isEdit: any = [];
    sortedData: any = [];
    specialCharError: string = null;
    showEmptyErrorMessage: string;
    disableAll: boolean = false;
    pageEvent: any;
    atsignType: string = 'Custom';
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    createAtsignId: any;
    showCommissionError: boolean= false;
    comissionError: boolean= false;
    showDiscountError: boolean= false;
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
        this.getAllCommissionAtsignData(data);
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
                    this.getAllCommissionAtsignData(data)
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
                    this.getAllCommissionAtsignData(data)
                    // this.loadLessonsPage();
                })
            )
            .subscribe();

    }

    getAllCommissionAtsignData(data) {
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
        this.userService.getAllCommissionAtsigns(data).subscribe(
            res => {
                // console.log(res);
                this.allAtsigns = res['data'] && res['data']['records'] ? res['data']['records'] : [];
                this.totatData = res['data'] && res['data']['total'] ? res['data']['total'] : 0;
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
    onKeyPressHandle(event) {
        this.formValidation = false;
        // if (!this.model.commissionPercentage) this.model.commissionPercentage = 0
        // if (!this.model.discountOfferedPercentage) this.model.discountOfferedPercentage = 0
        if (Number(this.model.commissionPercentage) <= 100 && Number(this.model.discountOfferedPercentage) <= 100) {
            this.specialCharError = event;
        } else {
            this.showErrorMessage = "Percentage can't be greater than 100";
        }
    }
    addAtsign() {
        this.formValidation = false;
        this.showErrorMessage = '';
        this.showSuccessMessage = '';
        if (!this.model.commissionPercentage) this.model.commissionPercentage = 0
        if (!this.model.discountOfferedPercentage) this.model.discountOfferedPercentage = 0
        if (this.model.atsign && this.model.commissionPercentage) {
            if (100 >= this.model.commissionPercentage && 100 >= this.model.discountOfferedPercentage) {
                if (this.model.commissionPercentage < this.model.discountOfferedPercentage) {
                    return this.showErrorMessage = "Commission can't be less than discount";
                }

                if (this.model.maxDiscountAmount && !this.model.discountOfferedPercentage) {
                    return this.showErrorMessage = "Oops, please set discount percentage before setting max discount";
                }
                this.userService.addCommissionAtsigns({ 'atsign': this.model.atsign, 'commissionPercentage': this.model.commissionPercentage, 'discountOfferedPercentage': this.model.discountOfferedPercentage, 'maxDiscountAmount': this.model.maxDiscountAmount }).subscribe(
                    res => {
                        if (res['status'] === 'success') {
                            this.createAtsignId = res['data'] && res['data']['saved'] ? res['data']['saved']['_id'] : [];
                            this.allAtsigns.push({ '_id': this.createAtsignId, 'atsign': this.model.atsign, 'commissionPercentage': this.model.commissionPercentage, 'discountOfferedPercentage': this.model.discountOfferedPercentage, 'maxDiscountAmount': this.model.maxDiscountAmount });
                            this.dataSource = new MatTableDataSource(this.allAtsigns);
                            this.showSuccessMessage = res['message'];
                            this.model = {};
                        } else {
                            this.showErrorMessage = res['message'];
                        }
                        this.isEdit = [];
                        this.SpinnerService.hide();
                    },
                    err => {
                        //console.log(err);
                    }
                );
                // } else {
                //     this.formValidation = true;
                // }
            } else {
                this.showErrorMessage = "Percentage must be less than 100";
            }
        } else {
            this.showErrorMessage = " Please fill all details";
        }
    }

    editAtsign(data) {
        this.isEdit = [];
        let index;
        if (this.sortedData.length > 0) {
            index = this.sortedData.findIndex(s => s['atsign'] == data.atsign)
        } else {
            index = this.dataSource.filteredData.findIndex(s => s['atsign'] == data.atsign)
            if (this.pageEvent) {
                index = index - (this.pageEvent.pageSize * this.pageEvent.pageIndex);
            }
        }
        this.isEdit[index] = true;
        this.disableAll = true;
    }
    updateAtsign(data) {
        if(!data.commissionPercentage) data.commissionPercentage = 0
        if(!data.discountOfferedPercentage) data.discountOfferedPercentage = 0
        if(!data.maxDiscountAmount) data.maxDiscountAmount = 0
        if (isNaN(data.commissionPercentage) || isNaN(data.discountOfferedPercentage) || isNaN(data.maxDiscountAmount)) {
            return this.showEmptyErrorMessage = "Oops, please set valid values";
        }
        this.formValidation = false;
        if (100 >= data.commissionPercentage && 100 >= data.discountOfferedPercentage) {
            if (data.commissionPercentage) {
                if (data.commissionPercentage < data.discountOfferedPercentage) {
                   // return this.showEmptyErrorMessage = "Commission can't be less than discount";
                   return null;
                }
                data.commissionPercentage = Number(data.commissionPercentage)
                data.discountOfferedPercentage = Number(data.discountOfferedPercentage)
                data.maxDiscountAmount = Number(data.maxDiscountAmount)
                if (data.maxDiscountAmount && !data.discountOfferedPercentage) {
                    return this.showEmptyErrorMessage = "Oops, please set discount percentage before setting max discount";
                }
                this.userService.updateCommissionAtsign(data).subscribe(
                    res => {
                        if (res['status'] === 'success') {
                            this.model = {
                                name: '',
                                brandName: false
                            };
                            this.isEdit = [];
                            this.disableAll = false;
                        } else {
                            this.isEdit = [];
                            this.disableAll = false;
                        }
                        this.SpinnerService.hide();
                    },
                    err => {
                        //console.log(err);
                    }
                );
            } else {
                this.showEmptyErrorMessage = "Please fill value";
            }
        } else {
            // this.showEmptyErrorMessage = "Percentage must be less than 100";
            return null;
        }
    }
    onPaginateChange(e) {
        this.isEdit = [];
    }
    openDialog(data): void {
        const dialogRef = this.dialog.open(CommissionAtsignModelComponent, {
            width: '500px',
            data: { id: data._id, atsign: data.atsign }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.event === 'Deleted') {
                // var index = this.allAtsigns.findIndex(s => s['atsign'] == result.data)
                // this.allAtsigns.splice(index, 1);
                // this.dataSource = new MatTableDataSource(this.allAtsigns);
                // this.isEdit = [];
                let data = {
                    pageNo: this.paginator.pageIndex + 1,
                    limit: this.paginator.pageSize,
                    sortBy: this.sort.active ? this.sort.active : 'name',
                    sortOrder: this.sort.direction ? this.sort.direction : 'asc',
                    searchTerm: this.input.nativeElement.value ? this.input.nativeElement.value : '',
                    atsignType: this.atsignType
                }
                this.getAllCommissionAtsignData(data)
            }
        });
    }

    openHelpDialog() {
        this.dialog.open(HelpComponent, {
            width: '500px'
        });
    }
    errorCommissionMessage(data) {
        let maxValue = 100;
        if (maxValue < data.commissionPercentage) {
            this.showCommissionError = true;
            this.showEmptyErrorMessage = "Percentage must be less than 100";
            
           
        }
        else {
            this.showCommissionError = false; 
            if(data.commissionPercentage < data.discountOfferedPercentage){
                this.comissionError = true;
                this.showEmptyErrorMessage = "Commission can't be less than discount";
            }
            else{
                this.comissionError = false;
            }
              
        }}

        errorDiscountMessage(data) {
            let maxValue = 100;
            if (maxValue < data.discountOfferedPercentage) {
                this.showDiscountError = true;
                this.showEmptyErrorMessage = "Percentage must be less than 100";
              
            }
            else {
                this.showDiscountError = false; 
                if(data.commissionPercentage < data.discountOfferedPercentage){
                    this.comissionError = true;
                    this.showEmptyErrorMessage = "Commission can't be less than discount";
                }
                else{
                    this.comissionError = false;
                }
                       
            }
        }
    
}

