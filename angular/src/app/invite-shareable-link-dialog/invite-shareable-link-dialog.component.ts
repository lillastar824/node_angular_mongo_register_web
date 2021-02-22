import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { environment } from 'src/environments/environment';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-invite-shareable-link-dialog',
  templateUrl: './invite-shareable-link-dialog.component.html',
  styleUrls: ['./invite-shareable-link-dialog.component.css']
})
export class InviteShareableLinkDialogComponent implements OnInit {
  allAtSigns: any = [];
  model: any = {
    atsignName: ''
  };
  noAtSign: boolean = false;
  Object = Object;

  constructor(private userService: UserService,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getAllAtSigns();
  }

  getAllAtSigns() {
    this.noAtSign = false;
    this.userService.getAllAtsignOfCurrentUser().subscribe(
      res => {
        if (res['status'] === 'success') {
          this.allAtSigns = res['data'];
          if(this.allAtSigns.Free.length === 0 && this.allAtSigns.Paid.length === 0){
            this.noAtSign = true;
          }
          else if(this.allAtSigns.Free.length === 0)
          {
            delete this.allAtSigns.Free;
          }
          else if(this.allAtSigns.Paid.length === 0)
          {
            delete this.allAtSigns.Paid;
          }
        }
      },
      err => {
        //console.log(err);
      }
    );
  }
  copyInputMessage() {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = environment.shareInvite + this.model.atsignName;
    // selBox.value = window.location.origin + '/home/' + this.model.atsignName;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this._snackBar.open('Invite link copied to clipboard', 'x', {
      duration: 15000,
      panelClass: ['custom-snackbar']
    });
  }
}
