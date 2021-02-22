import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatSnackBar, MAT_DIALOG_DATA } from "@angular/material";
import { UserService } from "../shared/services/user.service";
import { UtilityService } from "../shared/services/utility.service";
import { ConfirmDeleteContactDialogComponent } from "./dialog/confirm-delete-contact-dialog/confirm-delete-contact-dialog.component";

@Component({
  selector: "app-verification-methods-dialog",
  templateUrl: "./verification-methods-dialog.component.html",
  styleUrls: ["./verification-methods-dialog.component.css"],
})
export class VerificationMethodsDialogComponent implements OnInit {
  changeEmail: boolean = false;
  changeContact: boolean = false;
  contactVerificationCodeSent: boolean = false;
  emailVerificationCodeSent: boolean = false;
  serverErrorMessage: string;
  verificationCode: any;
  verificationCodeOtp: any = {};
  resendPrefix: boolean;
  countryCode: string = "+1";

  constructor(
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private utilityService: UtilityService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    console.log(this.data);
    if (!this.data.contactVerified) {
      this.changeContact = true;
    }
  }

  telInputObject(e) {
    e.setNumber(`+${this.data.countryCode + this.data.contact}`)
  }
  
  onCountryChange(e) {
    this.countryCode = "+" + e.dialCode;
  }

  touchNumber(event){
    this.changeContact = true;
    this.contactVerificationCodeSent = false;
  }

  verificationSendOTP(value, type) {
    const data = {};
    this.serverErrorMessage = "";
    if (type === "contact") {
      if (
        value &&
        this.utilityService.checkMobileValid(
          this.countryCode + this.utilityService.contactUglify(value)
        )
      ) {
        data["contact"] =
          this.countryCode + ' ' + this.utilityService.contactUglify(value);
        this.contactVerificationCodeSent = false;
      } else {
        this._snackBar.open("Please enter a valid mobile number.", "x", {
          duration: 15000,
          panelClass: ["custom-snackbar"],
        });
        return;
      }
    } else {
      if (value && this.utilityService.checkEmailValid(value)) {
        data["email"] = value;
        this.emailVerificationCodeSent = false;
      } else {
        this._snackBar.open("Please enter a valid email address.", "x", {
          duration: 15000,
          panelClass: ["custom-snackbar"],
        });
        return;
      }
    }
    this.userService.verificationSendOTP(data).subscribe((res) => {
      if (res["status"] === "success") {
        if (type === "contact") {
          this.contactVerificationCodeSent = true;
        } else {
          this.emailVerificationCodeSent = true;
        }
      } else {
        this._snackBar.open(res["message"], "x", {
          duration: 15000,
          panelClass: ["custom-snackbar"],
        });
        // this.serverErrorMessage = res["message"];
      }
    });
  }

  resendVerificationCode(value, type) {
    this.verificationSendOTP(value, type);
    this.resendPrefix = true;
  }
  verificationVerifyOTP(value, type) {
    const data = {};
    if (!this.verificationCode) {
      this._snackBar.open("Please enter verification code.", "x", {
        duration: 15000,
        panelClass: ["custom-snackbar"],
      });
      return;
    }
    this.serverErrorMessage = "";
    if (type === "contact") {
      data["contact"] =
        this.countryCode + ' ' + this.utilityService.contactUglify(value);
    } else {
      data["email"] = value;
    }
    data["otp"] = this.verificationCode;
    this.userService.verificationVerifyOTP(data).subscribe((res) => {
      if (res["status"] === "success") {
        if (type === "contact") {
          this.contactVerificationCodeSent = false;
          this.data.contactVerified = true;
          this.changeContact = false;
          this.data.combinedContactNumber = this.countryCode + ' ' + this.utilityService.contactUglify(value);
          this.userService.selectHandle.contact = this.data.combinedContactNumber;
          this._snackBar.open("Contact has been successfully verified.", "x", {
            duration: 15000,
            panelClass: ["custom-snackbar"],
          });
        } else {
          this.emailVerificationCodeSent = false;
          this.data.emailVerified = true;
          this.changeEmail = false;
          this.userService.selectHandle.email = this.data.email;
          this._snackBar.open("Email has been successfully verified.", "x", {
            duration: 15000,
            panelClass: ["custom-snackbar"],
          });
        }
        this.verificationCode = null;
        this.verificationCodeOtp = {
          otp1: null,
          otp2: null,
          otp3: null,
          otp4: null,
        };
      } else {
        this._snackBar.open(res["message"], "x", {
          duration: 15000,
          panelClass: ["custom-snackbar"],
        });
        // this.serverErrorMessage = res["message"];
      }
    });
  }
  keytab(event) {
    let name = event.name;      
    let value = event.value
    this.verificationCodeOtp[name] = value;
    if (
      event.keyCode === 8 &&
      value.length === 0 &&
      event.target.closest("mat-form-field")
    //   .previousSibling &&
    //   event.target
    //     .closest("mat-form-field")
    //     .previousSibling.querySelector("input")
    ) {
      event.target
        .closest("mat-form-field")
        // .previousSibling.querySelector("input")
        // .focus();
    //   event.target
    //     .closest("mat-form-field")
    //     .previousSibling.querySelector("input").value = "";
    } else if (
      !(event.keyCode === 16 && event.keyCode === 9) &&
     value.length === event.target.maxLength
    ) {
      event.target.closest("mat-form-field").nextElementSibling &&
        event.target
          .closest("mat-form-field")
          .nextElementSibling.querySelector("input")
          .focus();
    }
    this.verificationCode =
      this.verificationCodeOtp.otp1 +
      this.verificationCodeOtp.otp2 +
      this.verificationCodeOtp.otp3 +
      this.verificationCodeOtp.otp4;
}
  changeEmailNv(){
      this.changeEmail = !this.changeEmail;
      if(this.data.email != this.userService.selectHandle.email){
        this.data.email = this.userService.selectHandle.email;
      }
  }
  onOTPPaste($event) {
    $event.preventDefault();
    let clipboardData = $event.clipboardData || (<any>window).clipboardData;
    let pastedCode = clipboardData.getData('text');

    this.verificationCodeOtp = {
      otp1: null,
      otp2: null,
      otp3: null,
      otp4: null,
    }
        let codes = pastedCode.split('');

        for(let i=0; i<4; i++) {
            if(codes[i]) {
                this.verificationCodeOtp[`otp${i+1}`] = codes[i].toUpperCase();
            }
        }   
        this.verificationCode =
          this.verificationCodeOtp.otp1 +
          this.verificationCodeOtp.otp2 +
          this.verificationCodeOtp.otp3 +
          this.verificationCodeOtp.otp4;     
}

  deleteContact() {
    const dialogRef = this.dialog.open(ConfirmDeleteContactDialogComponent, {
      width: '90%',
      maxWidth: '600px',
      backdropClass: 'confirmation-dialog-overlay-backdrop',
      panelClass: ['top-center-panel', 'confirmation-dialog-panel']
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.removeContact().subscribe(
          (res) => {
            if ( res["status"] === 'success') {
              this.data.combinedContactNumber = ''
              this.data.contact = ''
              this.data.contactVerified = false
              this.data.countryCode = ''
              this.changeContact = true
              this.userService.selectHandle.contact = ''
              this._snackBar.open("Contact has been removed successfully.", "x", {
                duration: 15000,
                panelClass: ["custom-snackbar"],
              });
            } else {
              this._snackBar.open(res["message"], "x", {
                duration: 15000,
                panelClass: ["custom-snackbar"],
              });
            }
          }, err => {
            this._snackBar.open("Unable to remove contact. Try after some time.", "x", {
              duration: 15000,
              panelClass: ["custom-snackbar"],
            });
          }
        )
      }
    });

    
  }
}
