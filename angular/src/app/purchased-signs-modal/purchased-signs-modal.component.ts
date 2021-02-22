import { Component, OnInit, Inject, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, Sort, MatSort, MatSnackBar, MatTableDataSource } from '@angular/material';
import { ActivateAtsignComponent } from '../activate-atsign/activate-atsign.component';
import { UserService } from '../shared/services/user.service';
import { Router } from '@angular/router';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { UtilityService } from '../shared/services/utility.service';
import { ConfirmDeactivateModalComponent } from '../confirm-deactivate-modal/confirm-deactivate-modal.component';
import { PromoCodeComponent } from '../user/promo-code/promo-code.component';
import { TransferAtsignComponent } from '../transfer-atsign/transfer-atsign.component';
import { ManageAtsignComponent } from '../manage-atsign/manage-atsign.component';
import { MatPaginator } from '@angular/material/paginator';
import { AtsignDetail } from './atsign.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
@Component({
  selector: 'app-purchased-signs-modal',
  templateUrl: './purchased-signs-modal.component.html',
  styleUrls: ['./purchased-signs-modal.component.css']
})
export class PurchasedSignsModalComponent implements OnInit {

  isActivating: any = [];
  checkStatus;
  counterInterval: number = 0;
  atSignsForRenewal : any = [];
  allSelected:boolean=false;
  showFreeAtsigns:boolean = true;
  transferredAtsigns: any = [];
  showIncomingTransferAtsign:boolean = true;
  ATSIGN_TRANSFER_AFTER_DATE = new Date(2020, 4, 31);
  pageSize = 25;
  pageSizeOptions = [25, 50, 100, 200]
  isActivatingStatus = new Map();
  dataSource: MatTableDataSource<AtsignDetail> = new MatTableDataSource([]);
  @ViewChild('atsignsPaginator', { static : false }) paginator: MatPaginator;
  fetchingAtsigns = false;
  constructor(
    private userService: UserService,
    private utilityService: UtilityService,
    public dialog: MatDialog,
    private router: Router,
    public dialogRef: MatDialogRef<PurchasedSignsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _snackBar: MatSnackBar,
    private SpinnerService: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.fetchMyAtsigns();
    // this.initAtsignsStatusCheck();
    this.loadScript();
    this.getTransferredAtsigns();
  }

  ngAfterViewInit() {
    // this.initSort();
    this.dataSource.filterPredicate = (data: AtsignDetail, filter: string) => {
      return filter ? data.atsignType !== filter : true;
    };
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    })
  }

  ngOnDestroy() {
    clearInterval(this.checkStatus);
    this.dataSource.disconnect();
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  initAtsignsStatusCheck() {
    this.initiateCheckStatus();
    this.checkStatus = setInterval(() => {
      this.counterInterval++;
      if (this.counterInterval === 10) {
        this.initiateCheckStatus();
        // this.initiateCheckStatusAfterTen();
      } else {
        this.initiateCheckStatus();
      }
    }, 30000)
  }

  fetchMyAtsigns() {
    this.fetchingAtsigns = true;
    setTimeout(() => {
      this.SpinnerService.show();
    }, 0)
    this.userService.getUserProfile().subscribe(
      res => {
          this.fetchingAtsigns = false;
          let userDetails = res['user'];
          let handles = userDetails['atsignDetails'];
          handles.forEach(function(value, key) {
              if(!value['atsignName']){
                  handles.splice(key, 1);
              }
              if(value['isActivated'] == 1)
              {
                value['isActivated'] = 2;
              }
              // this.isActivating.push(false);
              if(value['atsignCreatedOn']){
                  var oneYearFromNow = new Date(value['atsignCreatedOn']);
                  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                  value['renewDate'] = new Date(oneYearFromNow).toLocaleString('default', { month: 'long' }) + ' ' + new Date(oneYearFromNow).getDate() + ', ' + new Date(oneYearFromNow).getFullYear();
              }
              else{
                  //console.log(value);
                  value['payNow']= value['inviteLink'];
                  value['verifyLink'] = "/account-verify//" + value['inviteCode'];
              }

            });
            var groupedAtsigns = this.groupBy(userDetails['atsignDetails'], 'atsignType'); // => {orange:[...], banana:[...]}
            this.data.freeAtSigns = groupedAtsigns.free ? groupedAtsigns.free : [];
            this.data.paidAtSigns = groupedAtsigns.paid ? groupedAtsigns.paid : [];
            this.data.atSigns = [...this.data.freeAtSigns, ...this.data.paidAtSigns];
            this.SpinnerService.hide();
            this.initDataSource();
      },
      err => {
          //console.log(err);
          this.fetchingAtsigns = false;
          this.SpinnerService.hide();
      }
  );
  }

  groupBy(arr, property) {
    return arr.reduce(function(data, x) {
      if (!data[x[property]]) { data[x[property]] = []; }
      data[x[property]].push(x);
      return data;
    }, {});
  }

  initDataSource() {
    let atSigns = [...this.data.atSigns].sort((a : AtsignDetail, b : AtsignDetail) => this.compare(a.atsignType, b.atsignType, true))
    this.dataSource.data = atSigns;
    this.dataSource._updateChangeSubscription();
    this.initAtsignsStatusCheck();
  }

  activateAtSign(atsign, type, index, isActivated, atSign) {
    if (isActivated !== 1 && isActivated !== 3) {
      this.isActivating[index] = true;
      this.isActivatingStatus.set(atSign._id, true)
    }
    if (isActivated !== 1) {
      this.updateAtsignActivatedStatus(atSign, isActivated ? isActivated : 2)    
      // if (type === "free") {
      //   this.data.freeAtSigns[index].isActivated = isActivated ? isActivated : 2;
      // } else {
      //   this.data.paidAtSigns[index].isActivated = isActivated ? isActivated : 2;
      // }
    }
    this.userService.activateAtSign({ 'atSignName': atsign }).subscribe(
      res => {
        if (res['status'] === 'success') {
          const dialogRef = this.dialog.open(ActivateAtsignComponent, {
            maxWidth: 470,
            maxHeight: '90vh',
            width: '90%',
            data: { atsignData: atsign, imgData: res['data']['QRcode'] },
            panelClass: 'activate-modalbox'
          });
          this.isActivating[index] = false;
          this.isActivatingStatus.set(atSign._id, false)
          dialogRef.afterClosed().subscribe(result => {
            if (isActivated !== 1) {

              this.checkStatus = setInterval(() => {
                this.counterInterval++;
                this.initiateCheckStatus();
              }, 30000);
            }
          });
        }
      },
      err => {
        this.isActivating[index] = false;
        this.isActivatingStatus.set(atSign._id, false)
        //console.log(err);
      }
    );
  }

  payNow(atsign, link) {
    //console.log(link)
    let reqData = {};

    if (this.userService.cartData.length === 0) {
      this.userService.getCartData(true).subscribe(res => {

        let arraylength = res['reservedsign'] && res['reservedsign'].length;
        for (let i = 0; i < arraylength; i++) {
          if (res['reservedsign'][i]['price']) {
            let data = {
              "atsignName": res['reservedsign'][i]['atsignName'],
              "premiumHandleType": this.utilityService.atSignTypeObject[res['reservedsign'][i]['atsignType']],
              "payAmount": res['reservedsign'][i]['price']
            }
            this.userService.cartData.push(data);
            this.userService.selectHandle.subTotal += res['reservedsign'][i]['price'];
            this.userService.selectHandle.atsignType = 'paid';
          }
        }
        if (res['orderAmountDetails'] && res['orderAmountDetails']['finalDiscountPercentage']) {
          this.userService.commercialAtsignDiscountPercentage = res['orderAmountDetails']['finalDiscountPercentage'];
        }
        reqData['cart'] = this.userService.cartData;
        this.userService.updateReserveAtsign(reqData).subscribe(
          res => {
            this.router.navigateByUrl(link);
          }, err => {
            // this.atsignSuccessMessage = '';
            // this.atsignErrorMessage = "Bummer! This @sign is not available anymore!";
          }
        );
      });
    } else {

      reqData['cart'] = this.userService.cartData;
      this.userService.updateReserveAtsign(reqData).subscribe(
        res => {
          this.router.navigateByUrl(link);
        }, err => {
          // this.atsignSuccessMessage = '';
          // this.atsignErrorMessage = "Bummer! This @sign is not available anymore!";
        }
      );
    }
  }
  async removeStandardAtSign(data) {
    // var index = this.data.freeAtSigns.findIndex(obj => obj['atsignName'] === data.atsignName);
    // this.data.freeAtSigns.splice(index, 1);
    
    const result = await this.userService.deleteStandardAtsign({ user_id: data._id, atsignName: data.atsignName }).toPromise();
    
    let msg = '@sign deleted successfully!'
    if (result['status'] !== 'error') {
      this.removeAtsignFromDataSource(data);
    }
    else {
      msg = result['message'] || 'Oops, unable to delete @sign';
    }
    this._snackBar.open(
      msg,
      "x",
      {
        duration: 10000,
        panelClass: ["custom-snackbar"],
      }
    );
  }
  confirmDelete(data) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '90%',
      maxWidth: '600px',
      backdropClass: 'confirmation-dialog-overlay-backdrop',
      panelClass: ['top-center-panel', 'confirmation-dialog-panel'],
      data: { atsignData: data }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event === 'Deleted') {
        this.removeStandardAtSign(result.data.atsignData)
      }
    });
  }
  confirmDeactivate(atsign, type, index, isActivated) {
    const dialogRef = this.dialog.open(ConfirmDeactivateModalComponent, {
      width: '90%',
      maxWidth: '600px',
      backdropClass: 'confirmation-dialog-overlay-backdrop',
      panelClass: ['center-center-panel', 'confirmation-dialog-panel'],
      data: { atsign, type, index, isActivated }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event === 'Deleted') {
        if (type === "free") {
          this.data.freeAtSigns[index].isActivated = 0;
        } else {
          this.data.paidAtSigns[index].isActivated = 0;
        }
      }
    });
  }
  createAnotherSign() {
    this.onNoClick();
    this.userService.createAnotherSign(this.userService.selectHandle.email, this.userService.selectHandle.contact);
  }

  checkAtSignStatus(atsign, index, type, atSign) {
    this.userService.checkAtSignStatus({ 'atSignName': atsign }).subscribe(
      res => {
        if (res['status'] !== 'error' && res['data'].data) {
          clearInterval(this.checkStatus);
          this.updateAtsignActivatedStatus(atSign, 1)
          // if (type === 'free') {
          //   this.data.freeAtSigns[index].isActivated = 1;
          // } else {
          //   this.data.paidAtSigns[index].isActivated = 1;
          // }
        }else if(res['status'] == 'error' && res['error_code'] && res['error_code'] === 418){
          this.updateAtsignActivatedStatus(atSign, 3)
          // if (type === 'free') {
          //   this.data.freeAtSigns[index].isActivated = 3;
          // } else {
          //   this.data.paidAtSigns[index].isActivated = 3;
          // }
        }
      },
      err => {

      }
    )
  }
  checkStatusAfterTen(atsign, index, type) {
    this.userService.checkActivateStatus({ 'atSignName': atsign }).subscribe(
      res => {
        if (res['status'] === 'error') {
          clearInterval(this.checkStatus);
        }
        this.counterInterval = 0;
      },
      err => {
        clearInterval(this.checkStatus);
      }
    )
  }

  initiateCheckStatus() {
    // if (this.data.paidAtSigns) {
    //   for (let i = 0; i < this.data.paidAtSigns.length; i++) {
    //     if (this.data.paidAtSigns[i].isActivated === 2) {
    //       this.checkAtSignStatus(this.data.paidAtSigns[i].atsignName, i, 'paid');
    //     }
    //   }
    // }
    // if (this.data.freeAtSigns) {
    //   for (let i = 0; i < this.data.freeAtSigns.length; i++) {
    //     if (this.data.freeAtSigns[i].isActivated === 2) {
    //       this.checkAtSignStatus(this.data.freeAtSigns[i].atsignName, i, 'free');
    //     }
    //   }
    // }
    
    if (this.dataSource.data) {
      for (let i = 0; i < this.dataSource.data.length; i++) {
        if (this.dataSource.data[i].isActivated === 2) {
          this.checkAtSignStatus(this.dataSource.data[i].atsignName, i, this.dataSource.data[i].atsignType, this.dataSource.data[i]);
        }
      }
    }
  }
  initiateCheckStatusAfterTen() {
    if (this.data.paidAtSigns) {
      for (let i = 0; i < this.data.paidAtSigns.length; i++) {
        if (this.data.paidAtSigns[i].isActivated === 2) {
          this.checkStatusAfterTen(this.data.paidAtSigns[i].atsignName, i, 'paid');
        }
      }
    }
    if (this.data.freeAtSigns) {
      for (let i = 0; i < this.data.freeAtSigns.length; i++) {
        if (this.data.freeAtSigns[i].isActivated === 2) {
          this.checkStatusAfterTen(this.data.freeAtSigns[i].atsignName, i, 'free');
        }
      }
    }
  }


  atsignManage(data, index) {
    const dialogRef = this.dialog.open(ManageAtsignComponent, {
      panelClass: 'fullscreen-dialog-panel',
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      data: data
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event === 'transferred') {
        // if (this.data.freeAtSigns) {
        //   let freeAtsignIndex = this.data.freeAtSigns.findIndex(atsign => {
        //     return atsign.atsignName == result.data.atsignName
        //   })
        //   if (freeAtsignIndex != -1) {
        //     this.data.freeAtSigns.splice(freeAtsignIndex, 1)
        //   }
        // }
        // if (this.data.paidAtSigns) {
        //   let paidAtsignIndex = this.data.paidAtSigns.findIndex(atsign => {
        //     return atsign.atsignName == result.data.atsignName
        //   })
        //   if (paidAtsignIndex != -1) {
        //     this.data.paidAtSigns.splice(paidAtsignIndex, 1)
        //   }
        // }

        this.removeAtsignFromDataSource(result.data) 

        this.getTransferredAtsigns();
      }
      if (result && result.event === 'AtsignDeleted') {
        this.removeStandardAtSign(result.data)
      }
      if (result && result.event === 'Deactivated') {
        // if (data.atsignType === "free") {
        //   this.data.freeAtSigns[index].isActivated = 0;
        // } else {
        //   this.data.paidAtSigns[index].isActivated = 0;
        // }
        this.updateAtsignActivatedStatus(result.data, 0)
        
      }
      if (result && result.event === 'SettingsUpdated') {
        this.updateAtsignAdvancedSettings(result.data);
      }
      if(result){
        this.isActivating= [];
        this.counterInterval = 0;
        this.atSignsForRenewal  = [];
        this.allSelected=false;
        this.showFreeAtsigns = true;
        this.showIncomingTransferAtsign = true;
        this.pageSize = 25;
        // this.isActivatingStatus = new Map();
      }
    });
  }

  updateAtsignAdvancedSettings(targetAtsign) {
    const index = this.dataSource.data.findIndex((atSign) => atSign._id === targetAtsign._id)
    this.dataSource.data[index].atsignDetailObj.advanceDetails = targetAtsign.atsignDetailObj.advanceDetails
  }		  
  addOrRemoveAtsignForRenewal(atSignName) {
    if(!this.isSelectedForRenewal(atSignName)) {
      this.atSignsForRenewal.push(atSignName);
    }
    else {
      this.atSignsForRenewal = this.atSignsForRenewal.filter((atSign) => atSign !== atSignName)
    }
    this.allSelected = [...this.data.paidAtSigns].filter((paidAtsign) => paidAtsign.isPayable).length === this.atSignsForRenewal.length;
  }

  isSelectedForRenewal(atSignName) {
    return this.atSignsForRenewal.indexOf(atSignName) >= 0
  }

  renewAllAtsigns(){
    this.atSignsForRenewal = [...this.data.paidAtSigns].filter((paidAtsign) => paidAtsign.isPayable).map((paidAtsign => paidAtsign.atsignName))
    this.renewSelectedAtsigns();
  }
  public loadScript() {
    let scripts = document.getElementsByTagName('script');
    let srcs = [];
    for (let i = 0; i < scripts.length; i++) {
        srcs.push(scripts[i].getAttribute('src'))
    }
    var dynamicScripts = ["https://js.stripe.com/v3/"];
    if (!this.getArraysIntersection(srcs, dynamicScripts)) {
        for (var i = 0; i < dynamicScripts.length; i++) {
            let node = document.createElement('script');
            node.src = dynamicScripts[i];
            node.type = 'text/javascript';
            node.async = false;
            node.charset = 'utf-8';
            document.getElementsByTagName('head')[0].appendChild(node);
        }
    }
  }

  getArraysIntersection(a1,a2){
    return  a1.some(function(n) { return a2.indexOf(n) !== -1;});
  }
  renewSelectedAtsigns() {
    if(this.atSignsForRenewal.length > 0) {
      this.dialogRef.close();
      this.router.navigate(['renewal-payment'], {state: {atSignsForRenewal : this.atSignsForRenewal}})
    }

  }
  selectUnselectAllAtsignForRenewal(isSelectAll) {
    this.allSelected = isSelectAll;
    let atsignForRenewal = []
    if (this.data.paidAtSigns.length>0 && isSelectAll) {
      this.data.paidAtSigns.forEach(atsign => {
        if (atsign.isPayable) {
          atsignForRenewal.push(atsign.atsignName)
        }
      })
      this.atSignsForRenewal = atsignForRenewal
    } else {
      this.atSignsForRenewal = []
    }
  }

  checkPayableAtsignExists() {
    return this.data.paidAtSigns ? this.data.paidAtSigns.some(atsign => atsign.isPayable == true):false;
  }

  initSort() {
    if(this.data.paidAtSigns) {
      const sortState: any = { active: 'renewalDate', direction: 'asc' };
      this.sortData(sortState)
    }
  }

  sortData(sort: Sort) {
    if(this.data.paidAtSigns) {
      const data = this.data.paidAtSigns;
      if (!sort.active || sort.direction === '') {
        this.data.paidAtSigns = data;
        return;
      }

      this.data.paidAtSigns = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'atsignName': return this.compare(a.atsignName, b.atsignName, isAsc);
          case 'renewalDate': return (a.renewalDate && b.renewalDate) ? this.compare(new Date(a.renewalDate), new Date(b.renewalDate), isAsc) : 0;
          default: return 0;
        }
      });
    }
  }

  compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  openManageDialog(){
    this.dialog.open(ManageAtsignComponent,{
      panelClass: 'fullscreen-dialog-panel',
      width: '100%',
      height: '100%',
      maxWidth: '100%'
    });
  }

  toggleFreeAtsigns() {
    this.showFreeAtsigns = !this.showFreeAtsigns;
    if(this.showFreeAtsigns) {
      this.dataSource.filter = null
    } else {
      this.dataSource.filter = 'free'
    }
    this.paginator.firstPage();
  }

  getTransferredAtsigns() {
    this.userService.atsignTransferList({}).subscribe(  res => {
      if (res['status'] === 'success') {
        this.transferredAtsigns = res["data"]["records"];
      }
    },
    err => {
      //console.log(err);
    })

  }

  cancelOrReject(transferAtsign, status) {
    const action = `${status === 'CANCELLED' ? 'Cancel' : 'Reject'}`
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '90%',
      maxWidth: '600px',
      backdropClass: 'confirmation-dialog-overlay-backdrop',
      panelClass: ['top-center-panel', 'confirmation-dialog-panel'],
      data: { title : `${action} Transfer Request` , confirmMessage: `Are you sure to ${action.toLowerCase()} the transfer request` }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateStatus(transferAtsign, status)
      }
    });

  }

  updateStatus(transferAtsign, status) {
    this.userService.updateTransferAtsignStatus(transferAtsign._id, {status}).subscribe(
      res => {

        if (res["status"] === "success") {
          transferAtsign.status = status;
          if( status === 'CANCELLED') {
            this.dataSource.data.push(transferAtsign.transferredObject);
            this.dataSource.data.sort((a, b) => this.compare(a.atsignType, b.atsignType, true))
            this.dataSource._updateChangeSubscription();
          }
        } else if(res["status"] === "error") {
          this._snackBar.open(res["message"], "x", {
            duration: 15000,
            panelClass: ["custom-snackbar"],
          });
        }
        
      }, err => {
      }
    );

  }
  resendTransferNotification(transferAtsign) {
    this.userService.resendTransferNotification(transferAtsign._id).subscribe(
      res => {
        if (res["status"] === "success") {
          this._snackBar.open(res["message"], "x", {
            duration: 15000,
            panelClass: ["custom-snackbar"],
          });
        } else if(res["status"] === "error") {
          this._snackBar.open(res["message"], "x", {
            duration: 15000,
            panelClass: ["custom-snackbar"],
          });
        }
        
      }, err => {
      }
    );

  }

  approveStatus(transferAtsign, status) {

    if(new Date(transferAtsign.transferredObject.atsignCreatedOn) > this.ATSIGN_TRANSFER_AFTER_DATE) {
      this.dialogRef.close();
      this.router.navigate(['transfer-atsign-payment'], {state: {transferAtsign : transferAtsign}})
    } else {
      this.updateStatus(transferAtsign, status)
    }
    
  }

  onTabChange(tabChangeEvent) {
    if(tabChangeEvent.index == 0) {
      this.fetchMyAtsigns();
    } else if(tabChangeEvent.index == 1) {
      this.getTransferredAtsigns();
    }
  }

  toggleIncomingTransferAtsigns() {
    this.showIncomingTransferAtsign = !this.showIncomingTransferAtsign;
  }

  updateAtsignActivatedStatus(targetAtsign, status) {
    const index = this.dataSource.data.findIndex((atSign) => atSign._id === targetAtsign._id)
    if(status === 2){
      this.dataSource.data[index].activationTime = new Date()
    }
    this.dataSource.data[index].isActivated = status;
    this.dataSource._updateChangeSubscription();
  }

  removeAtsignFromDataSource(targetAtsign) {
    var index = this.dataSource.data.findIndex(obj => obj['_id'] === targetAtsign._id);
    this.dataSource.data.splice(index, 1);
    this.dataSource._updateChangeSubscription()
  }

  checkIfFreeAtsignsAvailable() {
    return this.dataSource.data ? this.dataSource.data.some(atsign => atsign.atsignType === 'free'):false;
  }

  checkIfPaidAtsignsAvailable() {
    return this.dataSource.data ? this.dataSource.data.some(atsign => atsign.atsignType === 'paid'):false;
  }
  
  maskEmail(email) {
    return email.substr(0, 2) + '***' + email.substr(email.length-4, email.length);
  }

}
