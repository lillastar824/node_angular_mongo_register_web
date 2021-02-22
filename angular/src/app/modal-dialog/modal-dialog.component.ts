import { Component, OnInit, Inject } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  email: string;
  userDetails: any;
}


@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css']
})
export class ModalDialogComponent implements OnInit {

  showSucessMessage: boolean;
  serverErrorMessages: string;
  email: string;

  constructor(private userService: UserService,
    public dialogRef: MatDialogRef<ModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }


  ngOnInit() {
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  getInviteCode(email) {
    this.userService.getInviteCode({ email: this.data.email }).subscribe(
      res => {
        this.showSucessMessage = true;
        setTimeout(() => this.showSucessMessage = false, 4000);
        // this.resetForm(form);
      },
      err => {
        if (err.status === 422) {
          this.serverErrorMessages = err.error.join('<br/>');
        }
        else
          this.serverErrorMessages = 'Something went wrong.Please contact admin.';
      }
    );
  }

}
