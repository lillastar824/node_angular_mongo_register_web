import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material";
import { environment } from '../../environments/environment';
@Component({
  selector: "app-invite-history-dialog",
  templateUrl: "./invite-history-dialog.component.html",
  styleUrls: ["./invite-history-dialog.component.css"],
})
export class InviteHistoryDialogComponent implements OnInit {
  atmeURL:string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private _snackBar: MatSnackBar) {}

  ngOnInit() {
    this.atmeURL=environment.atmeURL;
  }
  copyInputMessage(inputElement) {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = inputElement;
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
