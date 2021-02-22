import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from 'src/app/shared/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailValidator } from '../../shared/validators/email.validator';

export interface DialogData { data }
@Component({
  selector: 'app-admin-transfer-atsign',
  templateUrl: './admin-transfer-atsign.component.html',
  styleUrls: ['./admin-transfer-atsign.component.css']
})
export class AdminTransferAtsignComponent implements OnInit {
  atsignTransferForm: FormGroup
  submitted = false;
  serverErrorMessages: string = ''
  inviteMessage: boolean;
  successMessages: string = ''
  atsign: any
  constructor(private userService: UserService, private formBuilder: FormBuilder, public dialogRef: MatDialogRef<AdminTransferAtsignComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData,
  private _snackBar: MatSnackBar) {
    this.atsign = data
  }
  ngOnInit() {
    this.atsignTransferForm = this.formBuilder.group({
      atsignEmail: ['', [Validators.required, Validators.email, EmailValidator]],
    });
  }
  get atsignFormControl() { return this.atsignTransferForm.controls; }

  close(): void {
    this.dialogRef.close();
  }
  inviteUser() {
    if (this.atsignTransferForm.invalid) return this.serverErrorMessages = 'Please enter a valid email address';
    this.userService.createFriendUser({ email: this.atsignTransferForm.value.atsignEmail, from: this.userService.selectHandle.email, personalNote: '', sendCopy: true }).subscribe(
      res => {
        if (res['status'] === 'error') {
          this.serverErrorMessages = res['message']
        } else {
          this._snackBar.open(
            'Congratulations! Invitation sent successfully',
            "x",
            {
              duration: 15000,
              panelClass: ["custom-snackbar"],
            }
          );
          this.dialogRef.close();
        }
      },
      err => {
        this.inviteMessage = false
        this.serverErrorMessages = err['error']['message']
      })
  }

  atsignTransfer(atsign) {
    if (this.atsignTransferForm.invalid) return this.serverErrorMessages = 'Please enter a valid email';
    this.serverErrorMessages = ''
    this.submitted = true;
    this.userService.atsignTransfer({ email: this.atsignTransferForm.value.atsignEmail, atsign: atsign.atsignName }).subscribe(res => {
      if (res['status'] === 'error') {
        if (res['showInvite']) {
          this.inviteMessage = true
        } else {
          this.serverErrorMessages = res['message']
        }
      } else {
        this.successMessages = res['message']
        setTimeout(() => {
          this.dialogRef.close({ event: 'transferred', data: atsign });
        }, 1500);
      }
    })
  }
}
