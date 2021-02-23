import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { Router } from "@angular/router";
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { MatTableDataSource } from '@angular/material';
import { MatSort } from '@angular/material/sort';
import { NgForm } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { UtilityService } from '../shared/services/utility.service';
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
import { merge, fromEvent } from "rxjs";

export interface atsignData { }
@Component({
    selector: 'app-reserved-atsigns',
    templateUrl: './reserved-atsigns.component.html',
    styleUrls: ['./reserved-atsigns.component.css']
})
export class ReservedAtsignsComponent implements OnInit {

    faTrash = faTrash;
    faEdit = faEdit;
    allAtsigns: any = [];
    showSucessMessage: boolean;
    serverErrorMessages: string;
    dataSource: MatTableDataSource<atsignData>;
    model: any = {
        name: '',
        brandName: false
    };
    displayedColumns: string[] = ['id', 'name', 'type', 'edit', 'delete'];
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
    @HostListener('matSortChange', ['$event'])
    sortChange(e) {
        // save cookie with table sort data here
        //console.log(e);
    }
    @ViewChild('input', { static: false }) input: ElementRef;
    totatData: Number = 0;

    constructor(private userService: UserService, private router: Router, private _snackBar: MatSnackBar,
        private SpinnerService: NgxSpinnerService, public dialog: MatDialog, private utilityService: UtilityService) {
    }

    ngOnInit() {
        let data = {
            pageNo: 1,
            pageSize: 25,
            sortBy: 'name',
            sortOrder: 'asc',
            searchTerm: '',
            atsignType: 'Custom'
        }
        this.getAllAtsignData(data);
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
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
                        pageSize: this.paginator.pageSize,
                        sortBy: this.sort.active ? this.sort.active : 'invitedOn',
                        sortOrder: this.sort.direction ? this.sort.direction : 'desc',
                        searchTerm: this.input.nativeElement.value ? this.input.nativeElement.value : '',
                        atsignType: this.atsignType
                    }
                    this.getAllAtsignData(data)
                    // this.loadLessonsPage();
                })
            )
            .subscribe();

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => {
                    let data = {
                        pageNo: this.paginator.pageIndex + 1,
                        pageSize: this.paginator.pageSize,
                        sortBy: this.sort.active ? this.sort.active : 'name',
                        sortOrder: this.sort.direction ? this.sort.direction : 'asc',
                        searchTerm: this.input.nativeElement.value ? this.input.nativeElement.value : '',
                        atsignType: this.atsignType
                    }
                    this.getAllAtsignData(data)
                    // this.loadLessonsPage();
                })
            )
            .subscribe();

    }
    tabClick(tab) {
        if (tab.index == 0) {
            this.atsignType = 'Custom';
        } else {
            this.atsignType = 'Brand';
        }
        this.getAllAtsignData('');
    }
    getAllAtsignData(data) {
        if (!data) {
            data = {
                pageNo: this.paginator.pageIndex + 1,
                pageSize: this.paginator.pageSize,
                sortBy: this.sort.active ? this.sort.active : 'name',
                sortOrder: this.sort.direction ? this.sort.direction : 'asc',
                searchTerm: this.input.nativeElement.value ? this.input.nativeElement.value : '',
                atsignType: this.atsignType
            }
        }
        this.SpinnerService.show();
        this.userService.getAllAtsigns(data).subscribe(
            res => {
                this.allAtsigns = res['atsigns'];
                this.totatData = res['totalData'];
                this.dataSource = new MatTableDataSource(this.allAtsigns);
                // this.dataSource.paginator = this.paginator;
                // this.dataSource.sort = this.sort;
                this.SpinnerService.hide();
                this.userService.currentUserType = 'admin';
            },
            err => {
                //console.log(err);
                if (err.error.message === "Unauthorized") {
                    this.router.navigateByUrl('/login');
                }
            }
        );
    }
    // applyFilter(filterValue: string) {
    //     this.isEdit = [];
    //     filterValue = filterValue.trim(); // Remove whitespace
    //     filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    //     this.dataSource.filter = filterValue;
    // }
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
        this.specialCharError = event;
    }
    addAtsign() {
        this.formValidation = false;
        this.showErrorMessage = '';
        this.showSuccessMessage = '';
        if (this.model.name) {
            this.userService.addReserveAtsigns({ 'name': this.model.name, 'type': this.model.brandName ? 'Brand' : 'Custom' }).subscribe(
                res => {
                    if (res['status'] === 'success') {
                        this.allAtsigns.push({ 'name': this.model.name, '_id': res['data']['_id'], 'type': this.model.brandName ? 'Brand' : 'Custom' });
                        this.dataSource = new MatTableDataSource(this.allAtsigns);
                        // this.dataSource.paginator = this.paginator;
                        // this.dataSource.sort = this.sort;
                        this.model = {
                            name: '',
                            brandName: false
                        };
                        this.showSuccessMessage = res['message'];
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
        } else {
            this.formValidation = true;
        }
    }
    editAtsign(data) {
        this.isEdit = [];
        let index;
        if (this.sortedData.length > 0) {
            index = this.sortedData.findIndex(s => s['name'] == data.name)
        } else {
            index = this.dataSource.filteredData.findIndex(s => s['name'] == data.name)
            if(this.pageEvent)
            {
                index = index -  (this.pageEvent.pageSize *  this.pageEvent.pageIndex);
            }
        }
        this.isEdit[index] = true;
        this.disableAll = true;
    }
    updateAtsign(data) {
        this.formValidation = false;
        if (data.name) {
            this.userService.updateSavedAtsign(data).subscribe(
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
            // this.formValidation = true;
            this.showEmptyErrorMessage = "@sign is invalid";
        }
    }
    onPaginateChange(e) {
        this.isEdit = [];
    }
    openDialog(data): void {
        //console.log(data, "data")
        const dialogRef = this.dialog.open(ConfirmationModalComponent, {
            width: '500px',
            data: { name: data.name, type: data.type, _id: data._id }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.event === 'Deleted') {
                var index = this.allAtsigns.findIndex(s => s['name'] == result.data)
                this.allAtsigns.splice(index, 1);
                this.dataSource = new MatTableDataSource(this.allAtsigns);
                // this.dataSource.paginator = this.paginator;
                // this.dataSource.sort = this.sort;
                this.isEdit = [];
            }
        });
    }
}
