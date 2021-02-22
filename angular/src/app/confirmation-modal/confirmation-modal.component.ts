import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Routes, RouterModule, Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogData {
    email: string;
    userid: string;
    name: string;
    type: string;
    _id: string;
    cartData: any;
    atsignData: any;
}

@Component({
    selector: 'app-confirmation-modal',
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent implements OnInit {

    serverErrorMessages: string;
    model: any = {
        deleteReason: ''
    }
    constructor(private userService: UserService,
        private route: ActivatedRoute,
        private router: Router,
        public dialogRef: MatDialogRef<ConfirmationModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private _snackBar: MatSnackBar) { }

    ngOnInit() {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    deleteUser(data) {
        this.userService.deleteUser({ userid: data, deleteReason: this.model.deleteReason }).subscribe(
            res => {
                this._snackBar.open('User deleted successfully.', 'x', {
                    duration: 15000,
                    panelClass: ['custom-snackbar']
                });
                this.dialogRef.close({event: 'Deleted', data: data});
            },
            err => {
                if (err.status === 422) {
                    this.serverErrorMessages = err.error.join('<br/>');
                } else {
                    this.serverErrorMessages = 'Something went wrong. Please contact admin.';
                }
            }
        );
    }
    deleteSavedAtsign(name, type, _id) {

        this.userService.deleteSavedAtsign({ name: name, type: type, _id: _id }).subscribe(
            res => {
                let msg = 'Reserved @sign deleted successfully.'
                let successRes: any = { event: 'Deleted', data: name };
                if (res['status'] === 'error') {
                    msg = res['message'];
                    successRes = {};
                }
                this._snackBar.open(msg, 'x', {
                    duration: 15000,
                    panelClass: ['custom-snackbar']
                });
                this.dialogRef.close(successRes);
            },
            err => {
                if (err.status === 422) {
                    this.serverErrorMessages = err.error.join('<br/>');
                } else {
                    this.serverErrorMessages = 'Something went wrong! Please contact admin.';
                }
            }
        );
    }
    deleteFromCart(data) {
        this.dialogRef.close({event: 'Deleted', data: data});
    }
    commonDelete(data) {
        if (data.from === 'delete_user') {
            this.deleteUser(data.userid);
        }
        if (data.name) {
            this.deleteSavedAtsign(data.name, data.type, data._id);
        }
        if (data.cartData) {
            this.deleteFromCart(data);
        }
        if (data.atsignData) {
            this.deleteFromCart(data);
        }
    }
}
