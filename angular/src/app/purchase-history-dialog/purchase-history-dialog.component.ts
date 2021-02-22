import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-purchase-history-dialog',
  templateUrl: './purchase-history-dialog.component.html',
  styleUrls: ['./purchase-history-dialog.component.css']
})
export class PurchaseHistoryDialogComponent implements OnInit {
  transactionData: any;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.getUserPaymentDetails();
  }
  
  getUserPaymentDetails() {
    this.userService.getUserPaymentDetails().subscribe(
        res => {
            if (res['status'] === 'success') {
                this.transactionData = res['data'];
            }
        },
        err => {
            //console.log(err);
        }
    );
}

}
