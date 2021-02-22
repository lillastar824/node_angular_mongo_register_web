import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from 'src/app/shared/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface DialogData {
  atsign: string;
  _id: string;
  totalFinalCommission : Number,
}

@Component({
  selector: 'app-commission-atsign-approve',
  templateUrl: './commission-atsign-approve.component.html',
  styleUrls: ['./commission-atsign-approve.component.css']
})
export class CommissionAtsignApproveComponent implements OnInit {
  referalCodeForm: FormGroup
  submitted = false;
  serverErrorMessages: string = ''
  atsignName: string;
  constructor(private userService: UserService, private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CommissionAtsignApproveComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private _snackBar: MatSnackBar) {
     this.atsignName = JSON.stringify(data);

  }
  ngOnInit() {
 
  }
 

  close(): void {
    this.dialogRef.close();
  }

  approveCommission(data) {
    this.userService.approveCommission(data).subscribe(res => {
   
        this._snackBar.open('Payment Approved successfully.', 'x', {
            duration: 15000,
            panelClass: ['custom-snackbar']
        });
        this.dialogRef.close({event: 'successfully', data: name});
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