import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { UtilityService } from '../shared/services/utility.service'
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
import { merge, fromEvent } from "rxjs";
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { AdminTransferAtsignComponent } from '../app/admin-transfer-atsign/admin-transfer-atsign.component';

export interface UserData { }
@Component({
    selector: 'app-show-users',
    templateUrl: './show-users.component.html',
    styleUrls: ['./show-users.component.css']
})

export class ShowUsersComponent implements OnInit {
    faUserPlus = faUserPlus;
    faHistory = faHistory;
    faTrash = faTrash;
    allUsers: UserData[] = [];
    userHistory;
    showSucessMessage: boolean;
    serverErrorMessages: string;
    dataSource: MatTableDataSource<UserData>;
    showHistoryTable: boolean = false;
    userCart: any = [{
        email: '',
        atsignName: '',
        payAmount: ''
    }];
    user: any = {
        email: '',
        atsignName: '',
        payAmount: ''
    };
    model: any = {
        inviteEmail: ''
    }
    displayedColumns: string[] = ['email', 'userStatus', 'atsignName', 'transfer', 'payAmount', 'orderId', 'inviteLink', 'userRole', 'friendInvite', 'invitedOn', 'atsignCreatedOn', 'inviteCode', 'mobileOtp', 'deleteUser', 'changePassword'];
    displayedColumnsHistoryTable: string[] = ['email', 'contact', 'atsignName', 'atsignType', 'updatedOn'];
    formValidation: boolean = false;
    inviteFormValidation: boolean = false;
    handleNotAvailable: boolean = false;
    showErrorMessage: string = '';
    inviteErrorMessage: string = '';
    specialCharError: string = null;
    invalidEmail: boolean = false;
    inviteInvalidEmail: boolean = false;
    totalData: Number = 0;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('input', { static: false }) input: ElementRef;

    constructor(private userService: UserService, private router: Router, private _snackBar: MatSnackBar,
        private SpinnerService: NgxSpinnerService, public dialog: MatDialog, private utilityService: UtilityService) {
    }


    ngOnInit() {
        let data = {
            pageNo: 1,
            pageSize: 25,
            sortBy: 'invitedOn',
            sortOrder: 'desc',
            searchTerm: ''
        }
        this.getAllUsers(data);
        // this.dataSource.paginator = this.paginator;
                // this.dataSource.sort = this.sort;

    }
    ngAfterViewInit() {

        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        //searching
        fromEvent(this.input.nativeElement, 'keyup')
            .pipe(
                debounceTime(1000),
                distinctUntilChanged(),
                tap(() => {
                    this.paginator.pageIndex = 0;
                    this.searchData();
                })
            )
            .subscribe();

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => {
                    this.searchData();
                })
            )
            .subscribe();
    }
    searchData() {
        let data = {
            pageNo: this.paginator.pageIndex + 1,
            pageSize: this.paginator.pageSize,
            sortBy: this.sort.active ? this.sort.active : 'invitedOn',
            sortOrder: this.sort.direction ? this.sort.direction : 'desc',
            searchTerm: encodeURIComponent(this.input.nativeElement.value ? this.input.nativeElement.value : '')
        }
        this.getAllUsers(data)
    }
    getAllUsers(data) {
        this.SpinnerService.show();
        this.userService.getAllUsers(data).subscribe(
            res => {
                this.allUsers = res['user'];
                this.totalData = res['user']['totalData'];
                this.userService.currentUserType = 'admin';
                this.dataSource = new MatTableDataSource(this.allUsers['users']);
                
                this.SpinnerService.hide();
            },
            err => {
                this.SpinnerService.hide();
                if (err.error.message === "Unauthorized") {
                    this.router.navigateByUrl('/login');
                }
            }
        );
    }
    // applyFilter(filterValue: string) {
    //     filterValue = filterValue.trim(); // Remove whitespace
    //     filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    //     this.dataSource.filter = filterValue;
    // }

    onLogout() {
        this.userService.deleteToken();
        this.router.navigate(['/login']);
    }
    fixDecimal(amount)
    {
        return parseFloat(amount).toFixed(2);
    }
    inviteUser(email, inviteCode) {
        if (!this.inviteInvalidEmail) {
            email = email.toLowerCase();
            if ((!inviteCode && email) || inviteCode) {
                this.SpinnerService.show();
                this.formValidation = false;
                var user = {};
                user['email'] = email;
                user['inviteCode'] = inviteCode;
                this.userService.sendInviteLink(user).subscribe(
                    res => {
                        this.SpinnerService.hide();
                        if (res['status'] === 'success') {
                            this.showErrorMessage = '';
                            this.inviteErrorMessage = '';
                            this.showSucessMessage = true;
                            if (inviteCode) {
                                var index = this.allUsers['users'].findIndex(user => user['email'] === email);
                                this.allUsers['users'][index]['atsignDetails'][0]['inviteLink'] = res['data'];

                            } else {
                                let userDetail = {};
                                userDetail['email'] = email;
                                userDetail["atsignDetails"] = [];
                                userDetail["atsignDetails"].push(
                                    {
                                        "inviteCode": res['inviteCode'],
                                        "inviteLink": res['inviteLink']
                                    })
                                userDetail['userStatus'] = 'Invited';
                                userDetail['userRole'] = 'User';
                                userDetail['_id'] = res['_id'];
                                userDetail['invitedOn'] = new Date().toISOString();
                                this.allUsers['users'].unshift(userDetail);
                                this.dataSource = new MatTableDataSource(this.allUsers['users']);
                                this.model.inviteEmail = '';


                            }
                            this._snackBar.open('Invite sent successfully', 'x', {
                                duration: 7000,
                                panelClass: ['custom-snackbar']
                            });
                        } else {
                            this.inviteErrorMessage = res['message'] + (res['data'] && res['data']['user_status'] ? ' User Status is ' + res['data']['user_status'] : '');
                        }
                        // setTimeout(() => this.showSucessMessage = false, 4000);
                        // this.resetForm(form);
                    },
                    err => {
                        this.SpinnerService.hide();
                        if (err.status === 422) {
                            this.serverErrorMessages = err.error.join('<br/>');
                        }
                        else
                            this.serverErrorMessages = 'Something went wrong.Please contact admin.';
                    }
                );
            } else {
                this.inviteFormValidation = true;
            }
        }
    }
    reInviteUser = this.inviteUser;
    viewHistory(email, contact) {
        this.showHistoryTable = true;
        var details = {};
        details['email'] = email;
        details['contact'] = contact;
        this.userService.viewHistory(details).subscribe(
            res => {
                this.userHistory = res['user'];
                this.dataSource = new MatTableDataSource(this.userHistory);
            },
            err => {
                //console.log(err);
            }
        );
    }
    checkValidEmail(email, type) {
        //console.log(email, type)
        this.invalidEmail = false;
        this.formValidation = false;
        this.inviteInvalidEmail = false;
        this.inviteFormValidation = false;
        let result = this.utilityService.checkEmailValid(email);
        if (!result) {
            if (type === 'invite') {
                this.inviteInvalidEmail = true;
            } else {
                this.invalidEmail = true;
            }
        }
    }
    addUser(form: NgForm) {
        this.showErrorMessage = '';
        if (!this.invalidEmail) {
        if (this.userCart[this.userCart.length - 1].payAmount.toString() !== "0") {
            if (this.userCart[0].email && this.userCart[0].atsignName && this.userCart[0].payAmount) {
                this.formValidation = false;
                this.SpinnerService.show();
                if (this.userCart[this.userCart.length - 1].atsignName === '') {
                    this.userCart.splice(this.userCart.length - 1, 1);
                }
                this.checkAtsignAvailability({ atsignName: this.userCart[this.userCart.length - 1].atsignName, atsignType: 'paid', fromAdmin: true }, (res) => {
                    if (res) {
                        this.handleNotAvailable = false;
                        this.addUserOrReserveAtsign({ userCart: this.userCart })
                    } else {
                        this.handleNotAvailable = true;
                        this.SpinnerService.hide();
                    }
                })
            }
            } else {
                this.showErrorMessage = "Amount must be greater than 0 and less than 100000";
            }
            } else {
                this.formValidation = true;
            }
    }

    addUserOrReserveAtsign(userId = null) {
        let data = { userCart: this.userCart };
        if(userId) data["userId"] = userId;
        this.userService.addUser(data).subscribe(
            res => {
                if (res['status'] === 'success') {
                    this.showErrorMessage = '';
                    this.showSucessMessage = true;
                    let user = {};
                    user['email'] = this.userCart[0].email;
                    user["atsignDetails"] = [];
                    for (let i = 0; i < this.userCart.length; i++) {
                        user["atsignDetails"].push(
                            {
                                "payAmount": this.userCart[i].payAmount,
                                "atsignName": this.userCart[i].atsignName,
                                "inviteLink": res['data']['inviteLink']

                            })
                    }
                    user['userStatus'] = 'Invited';
                    user['userRole'] = 'User';
                    user['_id'] = res['data']['_id'];
                    user['invitedOn'] = new Date().toISOString();
                    this.allUsers['users'].unshift(user);
                    this.dataSource = new MatTableDataSource(this.allUsers['users']);
                    this.userCart = [{
                        email: '',
                        atsignName: '',
                        payAmount: ''
                    }];
                    let selBox = document.createElement('textarea');
                    selBox.style.position = 'fixed';
                    selBox.style.left = '0';
                    selBox.style.top = '0';
                    selBox.style.opacity = '0';
                    selBox.value = res['data']['inviteLink'];
                    document.body.appendChild(selBox);
                    selBox.focus();
                    selBox.select();
                    document.execCommand('copy');
                    document.body.removeChild(selBox);
                    this._snackBar.open('Invite link copied to clipboard and sent to Email', 'x', {
                        duration: 15000,
                        panelClass: ['custom-snackbar']
                    });
                    // window.alert('Invite sent successfully')
                } else if(res['status'] === 'error' && res['data']['userId']) {
                    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                        width: '90%',
                        maxWidth: '600px',
                        backdropClass: 'confirmation-dialog-overlay-backdrop',
                        panelClass: ['top-center-panel', 'confirmation-dialog-panel'],
                        data: { title : 'Reserve @sign', confirmMessage: `This user already exists in the system, do you still want to reserve the @sign to the user?`}
                      });
                      dialogRef.afterClosed().subscribe(result => {
                        if (result) {
                            this.addUserOrReserveAtsign(res['data']['userId'])
                        }
                      });

                } else {
                    this.showErrorMessage = res['message'];
                }
                this.SpinnerService.hide();
            },
            err => {
                if (err.status === 422) {
                    this.serverErrorMessages = err.error.join('<br/>');
                }
                else
                    this.serverErrorMessages = 'Something went wrong.Please contact admin.';
                this.SpinnerService.hide();
            }
        );
    }
    addToCart(email, atsignName, payAmount) {
        this.showErrorMessage = '';
        if (!this.invalidEmail) {
            if(payAmount.toString() !== "0"){
            if (this.userCart[0].email && atsignName && payAmount) {
                this.SpinnerService.show();
                this.formValidation = false;
                this.checkAtsignAvailability({ atsignName: atsignName, atsignType: 'paid', fromAdmin: true }, (res) => {
                    if (res) {
                        this.handleNotAvailable = false;
                        let count = 0;
                        this.userCart.map(el => el.atsignName.toLowerCase() === atsignName.toLowerCase() ? count++ : count);
                        if (count < 2) {
                            this.userCart.push({
                                email: this.userCart[0].email,
                                atsignName: '',
                                payAmount: ''
                            })
                            this.showErrorMessage = "";
                        } else {
                            this.showErrorMessage = "@sign not available";
                        }
                        this.SpinnerService.hide();
                    } else {
                        this.handleNotAvailable = true;
                        this.SpinnerService.hide();
                    }
                })
            } 
        }else {
                this.showErrorMessage = 'Amount must be greater than 0 and less than 100000';
            }
            } else {
                this.formValidation = true;
            }
        
    }
    checkAtsignAvailability(atsignName, callback) {
        this.userService.checkAtsignAvailability(atsignName).subscribe(
            res => {
                if (res['status'] === 'success') {
                    callback(true);
                } else {
                    callback(false);
                }
            },
            err => {
                this.serverErrorMessages = 'Something went wrong.Please contact admin.';
                callback(false);
            }
        );
    }

    onKeyPressHandle(event) {
        this.formValidation = false;
        this.specialCharError = event;
    }

    openDialog(data): void {
        const dialogRef = this.dialog.open(ConfirmationModalComponent, {
            width: '500px',
            data: { userid: data._id, email: data.email, from: 'delete_user' }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.event === 'Deleted') {
                var index = this.allUsers['users'].findIndex(s => s['_id'] == result.data)
                if(this.allUsers['users'][index]['userStatus'] === 'Invited'){
                    this.allUsers['users'].splice(index,1)
                }else{
                    this.allUsers['users'][index]['userStatus'] = 'Deleted';
                }
                this.dataSource = new MatTableDataSource(this.allUsers['users']);
            }
        });
    }

    checkValue(value) {
        if (Number(value) < 1 || Number(value) > 100000) {
            this.showErrorMessage = "Amount must be greater than 0 and less than 100000";
        } else {
            this.showErrorMessage = "";
        }
    }
    changePassword(email, id) {
        const dialogRef = this.dialog.open(ChangePasswordComponent, {
            width: '500px',
            data: {fromGrid: true, id:id, email:email}
        });
        dialogRef.afterClosed().subscribe(result => {
            
        });
    }
    removeFromCart(atsignName, i){
        this.userCart = this.userCart.filter(item => item['atsignName'] !== atsignName);
    }
    trackByFn(index, item) {
      return index;
    }

    transferAtsign(atsign) {
        const dialogRef = this.dialog.open(AdminTransferAtsignComponent, {
            width: '90%',
            maxWidth: '600px',
            backdropClass: 'confirmation-dialog-overlay-backdrop',
            panelClass: ['top-center-panel', 'confirmation-dialog-panel'],
            data: atsign
          });
    }
}