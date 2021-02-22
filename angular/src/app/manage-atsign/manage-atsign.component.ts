import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from '../shared/services/user.service';
import { TransferAtsignComponent } from '../transfer-atsign/transfer-atsign.component';
import { faServer } from '@fortawesome/free-solid-svg-icons';
import { AtsignService } from '../shared/services/atsign.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { EmailValidator } from '../shared/validators/email.validator';

@Component({
  selector: 'app-manage-atsign',
  templateUrl: './manage-atsign.component.html',
  styleUrls: ['./manage-atsign.component.css']
})
export class ManageAtsignComponent implements OnInit {

  atsignTransferForm: FormGroup
  submitted = false;
  serverErrorMessages: string = ''
  inviteMessage: boolean;
  successMessages: string = ''
  atsign: any ;
  deleteErrorMessage: string = ''
  faServer = faServer;

  deleteForm = new FormGroup({
    atsignName: new FormControl("", Validators.required),
  });

  settingsForm = new FormGroup({
    domain : new FormControl("", Validators.required),
    port : new FormControl("", Validators.required)
  })

  activePanelIndex: number;

  constructor(private userService: UserService, private formBuilder: FormBuilder, public dialogRef: MatDialogRef<TransferAtsignComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private _snackBar: MatSnackBar, private atsignService : AtsignService, private spinnerService: NgxSpinnerService, public dialog: MatDialog,) {
    this.atsign = data
    if(this.isAdvanceSettingsAvailable()) {
      this.settingsForm.controls.domain.setValue(this.atsign.atsignDetailObj.advanceDetails.domain);
      this.settingsForm.controls.port.setValue(this.atsign.atsignDetailObj.advanceDetails.port);
    }
  }
  
  isAdvanceSettingsAvailable() {
    return this.atsign.atsignDetailObj && this.atsign.atsignDetailObj.advanceDetails && this.atsign.atsignDetailObj.advanceDetails.domain && this.atsign.atsignDetailObj.advanceDetails.port
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

  deleteAtsign() {
    if(this.deleteForm.invalid) {
      this.deleteErrorMessage = `Please enter @${this.atsign.atsignName} to delete!`
      return
    }
    if ('@' + this.atsign.atsignName === this.deleteForm.controls["atsignName"].value) {
      this.dialogRef.close({event: 'AtsignDeleted', data: this.atsign});
    } else {
      this.deleteErrorMessage = `Oops, the @sign you entered is incorrect!`;
    }    
  }

  updateSettings(isReset = false) {    
    const formValue = isReset ? { domain : '', port : ''} : this.settingsForm.value;

    if(!isReset && this.settingsForm.invalid) return

    this.spinnerService.show();

    this.atsignService.updateAtsignSettings({...formValue, atsign:this.atsign.atsignName}).subscribe(
      (res) => {
        this.spinnerService.hide();
        if( res["status"] === "success" ) {
          this._snackBar.open(
            res["message"],
            "x",
            {
              duration: 15000,
              panelClass: ["custom-snackbar"],
            }
          );
          this.atsign['atsignDetailObj']['advanceDetails'] = formValue
          this.dialogRef.close( {event : "SettingsUpdated", data : this.atsign} )
        } else {
          this._snackBar.open(
            res["message"],
            "x",
            {
              duration: 15000,
              panelClass: ["custom-snackbar"],
            }
          );
          this.dialogRef.close({ event: "Unable to update" });
        }
    }, err => {
      this.spinnerService.hide();
      this._snackBar.open(
        "Unable to update settings. Try again after some time.",
        "x",
        {
          duration: 15000,
          panelClass: ["custom-snackbar"],
        }
      );
      this.dialogRef.close({ event: "Unable to update" });
    })

  }

  resetSettings() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '90%',
      maxWidth: '600px',
      backdropClass: 'confirmation-dialog-overlay-backdrop',
      panelClass: ['top-center-panel', 'confirmation-dialog-panel'],
      data: { title : 'Reset Settings', confirmMessage: 'Are you sure to reset the settings' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateSettings(true)
      }
    });

  }

  onDeactivated(event, hasNextStep = false, activePanelIndex) {

    if (hasNextStep) {
      if (event.event === "Deactivated") {
        this.atsign.isActivated = 0;
        this.activePanelIndex = activePanelIndex;
      }
    } else {
      this.dialogRef.close(event);
    }

  }

}