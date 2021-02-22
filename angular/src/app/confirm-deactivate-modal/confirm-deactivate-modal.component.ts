import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from "@angular/material";
import { UserService } from "../shared/services/user.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-confirm-deactivate-modal",
  templateUrl: "./confirm-deactivate-modal.component.html",
  styleUrls: ["./confirm-deactivate-modal.component.css"],
})
export class ConfirmDeactivateModalComponent implements OnInit {
  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<ConfirmDeactivateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {}
  onNoClick(): void {
    this.dialogRef.close();
  }
  form = new FormGroup({
    atsignName: new FormControl("", Validators.required),
  });
  deactivateAtSign() {
    if ('@' + this.data.atsign === this.form.controls["atsignName"].value) {
      this.userService
        .deactivateAtSign({ atSignName: this.data.atsign })
        .subscribe(
          (res) => {
            if (res["status"] === "success") {
              this.dialogRef.close({ event: "Deleted" });
            } else {
              this._snackBar.open(
                "Unable to deactivate. Try again after some time.",
                "x",
                {
                  duration: 15000,
                  panelClass: ["custom-snackbar"],
                }
              );
              this.dialogRef.close({ event: "Unable to delete" });
            }
          },
          (err) => {
            //console.log(err);
          }
        );
    } else {
      this._snackBar.open("Oops, the @sign you entered is incorrect!", "x", {
        duration: 15000,
        panelClass: ["custom-snackbar"],
      });
    }
  }
}
