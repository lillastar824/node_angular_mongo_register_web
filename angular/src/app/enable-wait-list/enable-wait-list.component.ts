import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";


@Component({
  selector: 'app-enable-wait-list',
  templateUrl: './enable-wait-list.component.html',
  styleUrls: ['./enable-wait-list.component.css']
})
export class EnableWaitListComponent implements OnInit {

  toggle: number = 0;
  showErrorMessage: string;
  device: number;

  constructor(private userService: UserService, private router: Router, private _snackBar: MatSnackBar,
    private SpinnerService: NgxSpinnerService,) { }

  ngOnInit() {
    this.userService.getAppConfig().subscribe(
      res => {
        if(res['data']){
          let waitListConfig = res['data'].find(config => config.key === 'enable_waitlist')
          if (waitListConfig && waitListConfig.value == '1') {
            this.toggle = 1
          }
        }
      },err => {
        console.log(err);
      })
  }


  onChange(value) {
    if (value.checked === true) {
      this.device = 1;
    } else {
      this.device = 0;
    }

    this.userService.enableWaitList({ value: this.device }).subscribe(
      res => {
        if (res['status'] === 'success') {
          this._snackBar.open(res['message'], 'x', {
            duration: 15000,
            panelClass: ['custom-snackbar']
          });
        } else {
          this.showErrorMessage = res['message'];
        }
      },
      err => {
      }
    );
  }
}