import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from 'src/app/shared/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-promo-code',
  templateUrl: './promo-code.component.html',
  styleUrls: ['./promo-code.component.css']
})
export class PromoCodeComponent implements OnInit {
  referalCodeForm: FormGroup

  submitted = false;
  serverErrorMessages: string = ''
  constructor(private userService: UserService, private formBuilder: FormBuilder, public dialogRef: MatDialogRef<PromoCodeComponent>) {

  }
  ngOnInit() {
    this.referalCodeForm = this.formBuilder.group({
      referalCode: ['', (Validators.required)],
    });

  }

  get getFormControl() { return this.referalCodeForm.controls; }


  close(): void {
    this.dialogRef.close();
  }
  save() {
    if (this.referalCodeForm.invalid) return;
    this.submitted = true;

    console.log(this.referalCodeForm.value.referalCode);

    this.userService.applycartReferalCode({ cartReferalCode: this.referalCodeForm.value.referalCode }).subscribe(res => {
      if (res['status'] === 'error') {
        this.serverErrorMessages = res['message']
      } else {
        this.dialogRef.close();
      }
    })
  }


}