import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from 'src/app/shared/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';


export interface DialogData {data}
 

@Component({
  selector: 'app-commission-reports-details-model',
  templateUrl: './commission-reports-details-model.component.html',
  styleUrls: ['./commission-reports-details-model.component.css']
})
export class CommissionReportsDetailsModelComponent implements OnInit {
 
displayedColumns: string[] = ['id', 'createdDate', 'orderId', 'atsignName', 'payAmount'];
  recordNotFound: boolean = false;
  createdDate: any;
  orderId: any;


constructor(private userService: UserService, private formBuilder: FormBuilder,
  public dialogRef: MatDialogRef<CommissionReportsDetailsModelComponent>,   
  @Inject(MAT_DIALOG_DATA) public data: DialogData,
  private _snackBar: MatSnackBar) {
  this.createdDate = data;
  this.orderId = data;
}


  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
 
}
