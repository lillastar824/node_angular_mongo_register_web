import { Component, OnInit, Inject, ViewChildren, QueryList } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, Sort, MatSort } from '@angular/material';
import { ActivateAtsignComponent } from '../activate-atsign/activate-atsign.component';
import { UserService } from '../shared/services/user.service';
import { Router } from '@angular/router';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { UtilityService } from '../shared/services/utility.service';
import { ConfirmDeactivateModalComponent } from '../confirm-deactivate-modal/confirm-deactivate-modal.component';
import { PromoCodeComponent } from '../user/promo-code/promo-code.component';
import { TransferAtsignComponent } from '../transfer-atsign/transfer-atsign.component';

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
  constructor(
    private userService: UserService,
    private utilityService: UtilityService,
    public dialog: MatDialog,
    private router: Router,
    public dialogRef: MatDialogRef<PurchasedSignsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
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
    this.loadScript()
  }

  ngAfterViewInit() {
    // this.initSort();
  }

  ngOnDestroy() {
    clearInterval(this.checkStatus);
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  activateAtSign(atsign, type, index, isActivated) {
    if (isActivated !== 1 && isActivated !== 3) {
      this.isActivating[index] = true;
    }
    if (isActivated !== 1) {
      if (type === "free") {
        this.data.freeAtSigns[index].isActivated = isActivated ? isActivated : 2;
      } else {
        this.data.paidAtSigns[index].isActivated = isActivated ? isActivated : 2;
      }
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
    var index = this.data.freeAtSigns.findIndex(obj => obj['atsignName'] === data.atsignName);
    this.data.freeAtSigns.splice(index, 1);
    await this.userService.deleteStandardAtsign({ user_id: data._id, atsignName: data.atsignName }).toPromise();
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

  checkAtSignStatus(atsign, index, type) {
    this.userService.checkAtSignStatus({ 'atSignName': atsign }).subscribe(
      res => {
        if (res['status'] !== 'error' && res['data'].data) {
          clearInterval(this.checkStatus);
          if (type === 'free') {
            this.data.freeAtSigns[index].isActivated = 1;
          } else {
            this.data.paidAtSigns[index].isActivated = 1;
          }
        }else if(res['status'] == 'error' && res['error_code'] && res['error_code'] === 418){
          if (type === 'free') {
            this.data.freeAtSigns[index].isActivated = 3;
          } else {
            this.data.paidAtSigns[index].isActivated = 3;
          }
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
    if (this.data.paidAtSigns) {
      for (let i = 0; i < this.data.paidAtSigns.length; i++) {
        if (this.data.paidAtSigns[i].isActivated === 2) {
          this.checkAtSignStatus(this.data.paidAtSigns[i].atsignName, i, 'paid');
        }
      }
    }
    if (this.data.freeAtSigns) {
      for (let i = 0; i < this.data.freeAtSigns.length; i++) {
        if (this.data.freeAtSigns[i].isActivated === 2) {
          this.checkAtSignStatus(this.data.freeAtSigns[i].atsignName, i, 'free');
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


  atsignTransfer(data) {
    const dialogRef = this.dialog.open(TransferAtsignComponent, {
      width: '350px',
      data: data
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event === 'transfered') {
        if (this.data.freeAtSigns) {
          let freeAtsignIndex = this.data.freeAtSigns.findIndex(atsign => {
            return atsign.atsignName == result.data.atsignName
          })
          if (freeAtsignIndex != -1) {
            this.data.freeAtSigns.splice(freeAtsignIndex, 1)
          }
        }
        if (this.data.paidAtSigns) {
          let paidAtsignIndex = this.data.paidAtSigns.findIndex(atsign => {
            return atsign.atsignName == result.data.atsignName
          })
          if (paidAtsignIndex != -1) {
            this.data.paidAtSigns.splice(paidAtsignIndex, 1)
          }
        }
      }
    });
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
    let atsignForRenewal = []
    if (this.data.paidAtSigns.length>0 && isSelectAll) {
      this.data.paidAtSigns.forEach(atsign => {
        if (atsign.isPayable == true) {
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

}
