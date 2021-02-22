import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-activate-atsign',
  templateUrl: './activate-atsign.component.html',
  styleUrls: ['./activate-atsign.component.css']
})
export class ActivateAtsignComponent implements OnInit,OnDestroy {
  qrCode: any;
  checkActivate: NodeJS.Timer;

  constructor(public dialogRef: MatDialogRef<ActivateAtsignComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _snackBar: MatSnackBar,
    private userService: UserService) { }

  ngOnInit() {
    this.activateAtSign();
    this.checkActivate = setInterval(() => {
        this.activateAtSign();
    }, 10000)
  }
  ngOnDestroy() {
    clearInterval(this.checkActivate);
  }
  activateAtSign(){
    this.userService.checkAtSignStatus({ 'atSignName': this.data.atsignData }).subscribe(
      res => {
        if(res['status'] == 'error' && res['error_code'] && res['error_code'] === 418){
         this.qrCode = this.data.imgData;
         clearInterval(this.checkActivate);
        }
        },
        err => {
        //console.log(err);
      }
    );
  }
  onNoClick(): void {
    this.dialogRef.close();
}
}
