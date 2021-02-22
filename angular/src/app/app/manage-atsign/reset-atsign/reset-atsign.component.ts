import { EventEmitter } from '@angular/core';
import { Component, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-reset-atsign',
  templateUrl: './reset-atsign.component.html',
  styleUrls: ['./reset-atsign.component.css']
})
export class ResetAtsignComponent implements OnInit {

  resetServerErrorMessage: string = '';
  @Input() atsign: any;

  resetForm = new FormGroup({
    atsignName: new FormControl("", Validators.required),
  });

  @Output() 
  onAtsignDeactivated = new EventEmitter<any>();

  constructor(private userService: UserService, private spinnerService: NgxSpinnerService, private _snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  deactivateAtSign() {
    const activationTime = moment(this.atsign.activationTime)
    const currentTime = moment()
    const diff = currentTime.diff(activationTime, 'hours')
    
    if(this.atsign.isActivated == 2 && diff < 6){
      this.resetServerErrorMessage = `Your @sign is still being activated. Please check after ${(6-diff) > 0 ? (6-diff) + ' hours' : 'some time' } `
      return
    }

    
    if(this.resetForm.invalid) {
      this.resetServerErrorMessage = `Please enter @${this.atsign.atsignName} to reset`
      return
    }
    if ('@' + this.atsign.atsignName === this.resetForm.controls["atsignName"].value) {
      this.spinnerService.show();

      this.userService
        .deactivateAtSign({ atSignName: this.atsign.atsignName })
        .subscribe(
          (res) => {

            this.spinnerService.hide();

            this.resetServerErrorMessage = res["message"]
            let message = 'Oops, unable to reset @sign. Try again later.'
            if (res["status"] === "success") {
              message = '@sign reset successfully.';
              this.onAtsignDeactivated.emit({ event: "Deactivated", data : this.atsign });
            } else {
              this.onAtsignDeactivated.emit({ event: "Unable to delete" });
            }
            this._snackBar.open(
              message,
              "x",
              {
                duration: 15000,
                panelClass: ["custom-snackbar"],
              }
            );
          },
          (err) => {
            //console.log(err);
            this.spinnerService.hide();
          }
        );
    } else {
      this.resetServerErrorMessage = `Oops, the @sign you entered is incorrect!`;
    }
  }

}
