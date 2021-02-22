import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from 'src/app/shared/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface DialogData { data }

@Component({
  selector: 'app-transfer-atsign',
  templateUrl: './transfer-atsign.component.html',
  styleUrls: ['./transfer-atsign.component.css']
})
export class TransferAtsignComponent implements OnInit {
  atsignTransferForm: FormGroup
  submitted = false;
  serverErrorMessages: string = ''
  inviteMessage: boolean;
  successMessages: string = ''
  constructor(private userService: UserService, private formBuilder: FormBuilder, public dialogRef: MatDialogRef<TransferAtsignComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData,) {
  }
  ngOnInit() {
    this.atsignTransferForm = this.formBuilder.group({
      atsignEmail: ['', [Validators.required, Validators.email]],
    });
  }
  get atsignFormControl() { return this.atsignTransferForm.controls; }

  close(): void {
    this.dialogRef.close();
  }
  inviteUser() {
    if (this.atsignTransferForm.invalid) return this.serverErrorMessages = 'Please enter a valid email';
    this.userService.createFriendUser({ email: this.atsignTransferForm.value.atsignEmail, from: this.userService.selectHandle.email, personalNote: '', sendCopy: true }).subscribe(
      res => {
        if (res['status'] === 'error') {
          this.serverErrorMessages = res['message']
        } else {
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