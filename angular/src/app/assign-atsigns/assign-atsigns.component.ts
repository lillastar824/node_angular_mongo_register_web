import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource, Sort } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from '../shared/services/user.service';
import { EmailValidator } from '../shared/validators/email.validator';

@Component({
  selector: 'app-assign-atsigns',
  templateUrl: './assign-atsigns.component.html',
  styleUrls: ['./assign-atsigns.component.css']
})
export class AssignAtsignsComponent implements OnInit {

  assignedAtsigns: any = []
  dataSource: MatTableDataSource<any>;
  displayedColumns : string[] = ["atsignName", "email", "atsignCreatedOn"];
  assignAtsignForm = new FormGroup({
    atsign: new FormControl("", Validators.required),
    email: new FormControl("", [Validators.required, EmailValidator])
  });
  specialCharError: string = null;
  pageEvent: any;
  showErrorMessage = '';
  showSuccessMessage = '';
  totatData;
  submitted: boolean;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  
  constructor(private userService: UserService, private SpinnerService: NgxSpinnerService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.getAllAssignedAtsigns(0);
  }

  onKeyPressHandle(event) {
    this.specialCharError = event;
  }

  getAllAssignedAtsigns(pageIndex: 0) {

    let data = {
      limit : this.paginator.pageSize,
      pageNo : pageIndex + 1
    }

    this.SpinnerService.hide();

    this.userService.getAllAssignedAtsigns(data).subscribe((res) => {

        if( res["status"] === "success") {
          this.assignedAtsigns = res["data"]["records"]
          this.totatData = res["data"]["total"];
          this.dataSource = new MatTableDataSource(this.assignedAtsigns);

          this.dataSource._updateChangeSubscription();
        }

        this.SpinnerService.hide();
        
      },

      err => {
        
      }
    )

  }
  assignAtsign() {
    this.showSuccessMessage = '';
    this.showErrorMessage = '';
    this.specialCharError = '';
    this.assignAtsignForm.markAllAsTouched();
   
    if(!this.assignAtsignForm.controls.email.valid){
      this.showErrorMessage = "Invalid Email";
      this.showSuccessMessage = '';
      return 
    }
    
    if(this.assignAtsignForm.valid) {
      this.userService.assignAtsign(this.assignAtsignForm.value).subscribe((res) => {
        
        if(res["status"] === "success") {
          this.showSuccessMessage = res['message'];
          this.showErrorMessage = '';
          this.specialCharError = '';
          this.getAllAssignedAtsigns(0);
          this.assignAtsignForm.reset();
        } else {
            this.showErrorMessage = res['message'];
            this.showSuccessMessage = '';
        }
        
      })
    } else {
    }
    
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSource.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'atsignName': return this.compare(a.atsignName, b.atsignName, isAsc);
        case 'email': return this.compare(a.email, b.email, isAsc);
        case 'atsignCreatedOn': return (a.atsignCreatedOn && b.atsignCreatedOn) ? this.compare(new Date(a.createdOn), new Date(b.createdOn), isAsc) : 0;
        default: return 0;
      }
    });

    this.dataSource._updateChangeSubscription();
  }

  compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  onPaginateChange(e) {
    this.getAllAssignedAtsigns(e.pageIndex);
}
}
