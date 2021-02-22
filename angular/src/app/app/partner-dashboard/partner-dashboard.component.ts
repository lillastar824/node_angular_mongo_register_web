import { Component, OnInit, ViewChild } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { CommissionService } from 'src/app/shared/services/commission.service';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { CommissionReport } from './commission-report.model';
import { CommissionRevenue, CommissionRevenueSnapshot } from './commission-revenue.model';
import { FormControl, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-partner-dashboard',
  templateUrl: './partner-dashboard.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  styleUrls: ['./partner-dashboard.component.css']
})
export class PartnerDashboardComponent implements OnInit {
  displayedColumns = ['createdAt', 'atsign', 'orderAmount', 'finalCommission', 'totalNoOfTransactions'];
  reportsDataSource: MatTableDataSource<CommissionReport>;
  revenueSnapshot: CommissionRevenueSnapshot;
  pageEvent;
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  model: any = {
    fromDate: '',
    toDate: ''
  }

  tomorrow;
  total;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  pageIndex;

  constructor(private commissionService : CommissionService, private SpinnerService: NgxSpinnerService) {
    var date = new Date(), y = date.getFullYear(), m = date.getMonth();
    this.model.fromDate = new Date(y, m-1, date.getDate());
    this.model.toDate = date;
    this.tomorrow = new Date(); 
    this.tomorrow.setDate(this.tomorrow.getDate() + 1);
  }

  ngOnInit() {  
  }

  ngAfterViewInit() {
    this.getRevenueSnapshot();
    this.getCommissionReportDetails();
  }

  getCommissionReportDetails() {
    let dataParams = {
      fromDate : this.model.fromDate,
      toDate : this.model.toDate,
      limit : this.paginator.pageSize,
      pageNo : this.pageIndex + 1
    }
    this.SpinnerService.show();
    this.commissionService.getCommissionRepotsDetails(dataParams).subscribe(
      (res) => {
        this.SpinnerService.hide();
        if ( res["status"] === 'success') {
          this.total = res["data"]["total"]
          let data = res["data"]["records"].map((item) => new CommissionReport(item));
          this.reportsDataSource = new MatTableDataSource(data);
          this.reportsDataSource._updateChangeSubscription();
        }
      }
    )
  }

  getRevenueSnapshot() {
    this.SpinnerService.show();
    this.commissionService.getCommercialAtsignCommission({}).subscribe(
      (res) => {
        this.SpinnerService.hide();
        if ( res["status"] === 'success') {
          let data = res["data"]["records"];
          this.revenueSnapshot = new CommissionRevenueSnapshot(data)
        }

      }
    )
  }

  onPaginateChange(e) {
    this.pageIndex = e.pageIndex;
    this.getCommissionReportDetails();
  }

  onDateChange() {
    this.pageIndex = 0;
    this.getCommissionReportDetails();
  }

}
