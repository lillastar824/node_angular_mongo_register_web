import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../shared/services/user.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { UtilityService } from '../shared/services/utility.service';
import { Router } from '@angular/router';
import { PromoCodeComponent } from '../user/promo-code/promo-code.component';
@Component({
  selector: 'app-shopping-cart-dialog',
  templateUrl: './shopping-cart-dialog.component.html',
  styleUrls: ['./shopping-cart-dialog.component.css']
})
export class ShoppingCartDialogComponent implements OnInit {
  simpleDialog: MatDialogRef<PromoCodeComponent>;
  serverErrorMessages: string;
  emptyCartMessage: string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    public userService: UserService,
    public utilityService: UtilityService,
    public dialog: MatDialog,
    private router: Router,
    public dialogRef: MatDialogRef<ShoppingCartDialogComponent>,
    ) { }

  ngOnInit() {
    this.cleanUpCart();
    this.loadScript();
  }

  onNoClick(): void {
    this.dialogRef.close();
}

  async cleanUpCart() {
    let b = [];
    let c = [];
    this.userService.selectHandle['subTotal'] = 0;
    for (let i = 0; i < this.userService.cartData.length; i++) {
      if (b.indexOf(this.userService.cartData[i].atsignName) === -1) {
        b.push(this.userService.cartData[i].atsignName);
        c.push(this.userService.cartData[i]);
        this.userService.selectHandle['subTotal'] += this.userService.cartData[i].payAmount;
      }
    }
    this.userService.cartData = [];
    this.userService.cartData = [...c];
  }
  confirmDelete(data): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '90%',
      maxWidth: '600px',
      backdropClass: 'confirmation-dialog-overlay-backdrop',
      panelClass: ['top-center-panel', 'confirmation-dialog-panel'],
      data: { cartData: data }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event === 'Deleted') {
        this.removeFromCart(result.data.cartData)
      }
    });
  }
  async removeFromCart(data) {
    var index = this.userService.cartData.findIndex(obj => obj['atsignName'] === data.atsignName);
    this.userService.cartData.splice(index, 1);
    if (this.userService.cartData.length === 0) {
      this.userService.showTimer = false;
      this.emptyCartMessage = "No @sign in bag!"
    }
    this.userService.selectHandle.subTotal -= data.payAmount;
    await this.userService.deleteReserveAtsign({ atsignName: data.atsignName }).toPromise();
    this.recalculateCartAmount()
  }
  async register() {

    this.userService.checkLastVerification().subscribe(res =>{
      if(res['verify'] === false){
          this.proceedCheckout();
      }else{
        if (this.userService.dataFromAdmin) {
          this.userService.updateReserveAtsign({ atsignName: this.userService.selectHandle.atsignName, cart: this.userService.cartData, type: 'timestamp' }).subscribe(
            res => {
              if (this.userService.cartData.length > 0) {
                this.onNoClick();
                this.router.navigateByUrl('/account-verify/' + this.userService.selectHandle['inviteCode']);
              }
            }, err => {
              this.serverErrorMessages = "@sign not available";
            }
          );
        }
        else {
          this.onNoClick();
          this.router.navigateByUrl('/account-verify/' + this.userService.selectHandle['inviteCode']);
        }

      }
    });

    
  }
  tryAgain() {
    this.onNoClick();
    this.router.navigateByUrl('/premium-sign/' + this.userService.selectHandle['inviteCode']);
  }
 
async proceedCheckout() {
    if (this.userService.selectHandle.atsignType === 'free') {
        await this.userService.updateReserveAtsign({ atsignName: this.userService.selectHandle.atsignName, type: 'is_verified' }).toPromise();
    } else {
        await this.userService.updateReserveAtsign({ cart: this.userService.cartData, type: 'is_verified' }).toPromise();
    }
    for (let i = 0; i < this.userService.cartData.length; i++) {
        this.userService.cartData[i].is_verified = true;
    }

    this.onNoClick();
    this.router.navigateByUrl('/checkout');
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

  dialog1() {
    this.simpleDialog = this.dialog.open(PromoCodeComponent);

    this.simpleDialog.afterClosed().subscribe(result => {
      this.recalculateCartAmount()
    });
  }

  recalculateCartAmount(){
    let cartData = [],subTotal=0
    this.userService.getCartData(false).subscribe(res => {
      if (res['reservedsign'].length > 0) {
          this.userService.showTimer = res['timer'] > 0 ? true : false;
          this.userService.timeLeft = res['timer'];
          for (let i = 0; i < res['reservedsign'].length; i++) {
              // if (res['reservedsign'][i]['price'] > 0) {
              let data = {
                  "atsignName": res['reservedsign'][i]['atsignName'],
                  "premiumHandleType": this.utilityService.atSignTypeObject[res['reservedsign'][i]['atsignType']],
                  "payAmount": res['reservedsign'][i]['price'],
                  "is_verified": res['reservedsign'][i]['is_verified']
              }
              cartData.push(data);
              subTotal += res['reservedsign'][i]['price'];
          }
          this.userService.commercialAtsignDiscountPercentage = 0
          if(res['orderAmountDetails'] && res['orderAmountDetails']['finalDiscountPercentage']){
              this.userService.commercialAtsignDiscountPercentage =  res['orderAmountDetails']['finalDiscountPercentage'];
          }
          this.userService.cartData = cartData;
          this.userService.selectHandle.subTotal = subTotal;
      } else {
          this.userService.cartData = [];
          this.userService.selectHandle.subTotal = 0;
      }
      this.userService.selectHandle.atsignType = 'paid';
    });
  }
}
