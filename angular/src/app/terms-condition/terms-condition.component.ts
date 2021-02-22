import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-terms-condition',
  templateUrl: './terms-condition.component.html',
  styleUrls: ['./terms-condition.component.css']
})
export class TermsConditionComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<TermsConditionComponent>) { }

  ngOnInit() {
  }
  onNoClick(): void {
    this.dialogRef.close();
}

}
