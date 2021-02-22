import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from 'src/app/shared/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface DialogData {
  atsign: string;
  id: string;
}


@Component({
  selector: 'app-commission-atsign-model',
  templateUrl: './commission-atsign-model.component.html',
  styleUrls: ['./commission-atsign-model.component.css']
})
export class CommissionAtsignModelComponent implements OnInit {
  referalCodeForm: FormGroup
  submitted = false;
  serverErrorMessages: string = ''
  constructor(private userService: UserService, private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CommissionAtsignModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private _snackBar: MatSnackBar) {

  }
  ngOnInit() {
  }
 

  close(): void {
    this.dialogRef.close();
  }

  deleteAtsign(id) {
    this.userService.deleteCommissionAtsigns(id).subscribe(res => {
   
        this._snackBar.open('@sign deleted successfully.', 'x', {
            duration: 15000,
            panelClass: ['custom-snackbar']
        });
        this.dialogRef.close({event: 'Deleted', data: name});
    }),
    err => {
        if (err.status === 422) {
            this.serverErrorMessages = err.error.join('<br/>');
        } else {
            this.serverErrorMessages = 'Something went wrong.Please contact admin.';
        }
    
  }

  }
}