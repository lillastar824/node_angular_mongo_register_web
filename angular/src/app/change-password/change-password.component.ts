import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../shared/services/user.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// import custom validator to validate that password and confirm password fields match
import { MustMatch } from '../shared/validators/must-match.validator';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

    serverErrorMessages: string = '';
    model: any = {
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    }
    formValidation: boolean = false;
    registerForm: FormGroup;
    submitted = false;
    hideOld : boolean = true;
    hideNew : boolean = true;
    hideConfirm : boolean = true;

    constructor( private router: Router,private userService: UserService,
        public dialogRef: MatDialogRef<ChangePasswordComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _snackBar: MatSnackBar, private formBuilder: FormBuilder) { }

    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            oldPassword: ['', ((this.data && this.data.fromGrid)?'':Validators.required)],
            newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(25),  Validators.pattern('(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,25}')]],
            confirmPassword: ['', Validators.required]
        }, {
            validator: MustMatch('newPassword', 'confirmPassword')
        });
    }

    showPassword(hide) {
        this[hide] = !this[hide];
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
    get getFormControl() { return this.registerForm.controls; }

    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }
        this.changePassword(this.registerForm.value.oldPassword, this.registerForm.value.newPassword, this.registerForm.value.confirmPassword)
    }

    changePassword(oldPassword, newPassword, confirmNewPassword) {
        this.serverErrorMessages = '';
        this.formValidation = false;
        if ((this.data && this.data.fromGrid || oldPassword) && newPassword && confirmNewPassword) {
            if (newPassword === confirmNewPassword) {
                if ((this.data && !this.data.fromGrid) || newPassword !== oldPassword) {
                    let data = {
                        newPassword: newPassword,
                        confirmNewPassword: confirmNewPassword
                    };
                    if (this.data && this.data.fromGrid) {
                        data['fromGrid'] = true;
                        data['id'] = this.data.id;
                    } else {
                        data['oldPassword'] = oldPassword;
                    }
                    this.userService.changePassword(data).subscribe(
                        res => {
                            if (res['status'] === 'success') {
                                this._snackBar.open('Password updated successfully.', 'x', {
                                    duration: 15000,
                                    panelClass: ['custom-snackbar']
                                });
                                this.dialogRef.close({ event: 'Deleted' });
                                this.router.navigate(['/login/admin']);
                            } else {
                                this.serverErrorMessages = res['message'];
                            }
                        },
                        err => {
                            if (err.status === 422) {
                                this.serverErrorMessages = err.error.join('<br/>');
                            } else {
                                // this.serverErrorMessages = 'Something went wrong. Please contact admin.';
                            }
                        }
                    );
                } else {
                    this.serverErrorMessages = 'New password and old password should not be same.';
                }
            } else {
                this.serverErrorMessages = 'New password and confirm password should be same.';
            }
        } else {
            this.formValidation = true;
        }
    }
}
