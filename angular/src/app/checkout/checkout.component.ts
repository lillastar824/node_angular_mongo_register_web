import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';

import { NgForm } from '@angular/forms';
import { UserService } from '../shared/services/user.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from "@angular/router";
import { MatDialog } from '@angular/material/dialog';
import { TermsConditionComponent } from '../terms-condition/terms-condition.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
declare var Stripe;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cardNumberElement', { static: false }) cardNumberElement: ElementRef;
  @ViewChild('cardExpiryElement', { static: false }) cardExpiryElement: ElementRef;
  @ViewChild('cardCvcElement', { static: false }) cardCvcElement: ElementRef;


  card: any;
  cardNumber: any;
  cardExpiry: any;
  cardCvc: any;
  cardAtsign = this.onChange.bind(this);
  error: string;
  stripe: any;
  orderData: any;
  price: number;
  showSucessMessage: string;
  showErrorMessage: string;
  serverErrorMessages: string;
  code: string;
  userDetails;
  userId: String;
  checkoutTnC: boolean = false;
  fullAtsignName: string;
  disableSubmit: boolean = false;
  promoCardAmount: number = 0;
  invalidPromoCode: boolean;
  promoCardPendingAmount: number;
  amountToBeDeductedFromPromoCard: number = 0;
  disablePromoCode: boolean = false;
  constructor(private cd: ChangeDetectorRef, public userService: UserService,
    private SpinnerService: NgxSpinnerService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private router: Router) {
    this.route.params.subscribe(params => {
      this.code = params["code"];
    });
  }
  openDialog(type): void {
    const dialogRef = this.dialog.open(TermsConditionComponent, {
      width: '500px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed');
    });
  }

  async ngAfterViewInit() {
    if (this.code) {
      this.userService.showTimer = false;
      this.userService.selectHandle['subTotal'] = this.userService.selectHandle['subTotal'] ? this.userService.selectHandle['subTotal'] : 0;
      const res = await this.userService.getUserDetailsFromCode({ code: this.code }).toPromise()
        .catch(err => {
          this.router.navigateByUrl('/login');
        });
      if (res && res['status']) {
        this.userDetails = res['data']['user'];
        let atSignDetails = this.userDetails.atsignDetails;
        let handleToCheck = "";
        for (let i = 0; i < atSignDetails.length; i++) {
          if (atSignDetails[i].inviteCode === this.code) {
            handleToCheck = atSignDetails[i].atsignName;
          }
        }

        const data = await this.userService.checkPaidUser(handleToCheck).toPromise();
        if (data['message'] === "paid") {
          this.router.navigateByUrl('/login');
        }
        this.userService.selectHandle['atsignType'] = this.userDetails['atsignType'] ? this.userDetails['atsignType'] : 'paid';
        this.userService.selectHandle['atsignName'] = this.userDetails['atsignDetails'].find(o => o.inviteCode === this.code).atsignName;
        this.userService.selectHandle['contact'] = this.userDetails['contact'];
        this.userService.selectHandle['email'] = this.userDetails['email'];
        this.userService.selectHandle['inviteCode'] = this.code;
        this.userService.selectHandle['payAmount'] = this.userDetails['atsignDetails'].find(o => o.inviteCode === this.code).payAmount;
        this.userService.selectHandle['user_id'] = this.userDetails['_id'];
        for (let i = 0; i < this.userDetails['atsignDetails'].length; i++) {
          if (this.userDetails['atsignDetails'][i]['inviteCode'].indexOf(this.code) !== -1) {
            this.userService.cartData.push({
              'atsignName': this.userDetails['atsignDetails'][i]['atsignName'],
              'payAmount': this.userDetails['atsignDetails'][i]['payAmount'],
              'premiumHandleType': 'Reserved'
            })
            this.userService.selectHandle['subTotal'] += this.userDetails['atsignDetails'][i]['payAmount'];
          }
        }
      } else {
        this.router.navigateByUrl('/login');
      }
    } else if (!this.userService.selectHandle['email'] && !this.userService.selectHandle['contact']) {
      this.userService.checkLoggedInUser().subscribe(
        res => {
          if (res['status'] === 'success' && res['data']) {

            this.router.navigateByUrl(res['data']);
          } else {
            this.router.navigateByUrl('/login');
          }
          this.showSucessMessage = 'Saved Successfully.';
        },
        err => {
          if (err.status === 422) {
            this.showErrorMessage = err.error.join('<br/>');
          }
          else
            this.showErrorMessage = 'Something went wrong. Please try again.';
        }
      );
    } else {
      let is_verified = this.userService.cartData.map(data => data.is_verified);
      if (is_verified.indexOf(false) !== -1 || is_verified.indexOf(undefined) !== -1) {
        this.router.navigateByUrl('/premium-sign/' + this.userService.selectHandle.inviteCode);
      }
      this.userService.showTimer = true;
      // ******
      // get user_id of logged in user
      // assign it to this.userId
    }


    if (this.userService.selectHandle.subTotal > 0) {
      const style = {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          fontSmoothing: 'antialiased',
          '::placeholder': {
            color: 'rgba(0,0,0,0.4)'
          }
        }

      };

      const { key }: any = await this.userService.getStripePublishKey().toPromise();

      this.stripe = Stripe(key);
      const elements = this.stripe.elements();

      this.cardNumber = elements.create('cardNumber', { style });
      this.cardNumberElement && this.cardNumber.mount(this.cardNumberElement.nativeElement);

      this.cardExpiry = elements.create('cardExpiry', { style });
      this.cardExpiryElement && this.cardExpiry.mount(this.cardExpiryElement.nativeElement);

      this.cardCvc = elements.create('cardCvc', { style });
      this.cardCvcElement && this.cardCvc.mount(this.cardCvcElement.nativeElement);

      this.cardNumber.addEventListener('change', this.cardAtsign);
      this.cardExpiry.addEventListener('change', this.cardAtsign);
      this.cardCvc.addEventListener('change', this.cardAtsign);

      if (this.cardNumberElement) {
        // const data = await this.userService.fetchReserveAtsign({ user_id: this.userService.selectHandle.user_id || this.userId }).toPromise();

        // this.price = data['reserveHandle']['price'];

        this.orderData = {
          items: [{ id: "atsign-name" }],
          currency: "usd"
        };
      }
    }
  }

  ngOnDestroy() {
    if (this.userService.selectHandle.atsignType === 'paid' && this.cardNumber) {
      this.cardNumber.removeEventListener('change', this.cardAtsign);
      this.cardExpiry.removeEventListener('change', this.cardAtsign);
      this.cardCvc.removeEventListener('change', this.cardAtsign);
      this.cardNumber.destroy();
      this.cardExpiry.destroy();
      this.cardCvc.destroy();
    }
  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }

  async orderComplete(clientSecret) {
    this.SpinnerService.show();
    this.disableSubmit = true;
    try {
      const result = await this.stripe.retrievePaymentIntent(clientSecret).toPromise()
        .catch(err => {

          this.SpinnerService.hide();
          this.disableSubmit = false;
        });
    }
    catch (err) {

      this.SpinnerService.hide();
      this.disableSubmit = false;
    }


    // this.SpinnerService.hide();
    //************* 
    //direct checkout of user without login will redirect to login page
    //
    this.userService.savedCartData = this.userService.cartData;
    this.router.navigateByUrl('/accountconfirmation',{replaceUrl: true});
  }

  async handleAction(clientSecret,transactionId) {
    this.SpinnerService.show();
    this.disableSubmit = true;
    const data: any = await this.stripe.handleCardAction(clientSecret);
    if (data.error) {

      this.showErrorMessage = 'Your card was not authenticated, please try again';
      this.SpinnerService.hide();
      this.disableSubmit = false;
    } else if (data.paymentIntent.status === "requires_confirmation") {

      let response: any = await this.userService.stripePay({ paymentIntentId: data.paymentIntent.id, user_id: this.userService.selectHandle.user_id || this.userId,transactionId,clientSecret }).toPromise();
      if (!response) {
        this.showErrorMessage = 'Something went wrong. Please try again after sometime.';
        this.SpinnerService.hide();
        this.disableSubmit = false;
      }
      else if (response.error) {
        //*****
        // display error 
        // response.error is error message
        // showError(json.error);
        this.showErrorMessage = response.error;
        this.SpinnerService.hide();
        this.disableSubmit = false;
      } else if (response['status'] == 'error') {
        this.showErrorMessage = response['message'];
        this.SpinnerService.hide();
        this.disableSubmit = false;
      }
      else {
        this.orderComplete(clientSecret);
      }
    }
  }

  checkoutFreeOnlyCart() {
    this.saveAtsign();
    this.userService.savedCartData = this.userService.cartData;
    this.router.navigateByUrl('/accountconfirmation');
  }

  //Complete Paid order by deducting amount form card or promotional code
  async completePaidOrder(paymentMethodId,promotionalCode){
    this.orderData['paymentMethodId'] = paymentMethodId;
    this.orderData['promotionalCode'] = promotionalCode
    this.orderData['cartData'] = this.userService.cartData;
    this.orderData['inviteCode'] = this.userService.selectHandle['inviteCode'];
    this.orderData['atsignName'] = this.userService.selectHandle['atsignName'];
    this.orderData.user_id = this.userService.selectHandle.user_id || this.userId;
    if(!this.orderData['inviteCode']){
      let searchObject = {}
      if (this.userService.selectHandle.contact) {
        searchObject['contact'] = this.userService.selectHandle.contact;
      } else {
        searchObject['email'] = this.userService.selectHandle.email;
      }
      let createNewHandle = await this.userService.createNewHandle(searchObject).toPromise()
        let inviteCode =createNewHandle['user']['inviteCode'];
        this.orderData['inviteCode'] = this.userService.selectHandle['inviteCode'] = inviteCode
        if(!this.userService.selectHandle.payAmount) this.userService.selectHandle.payAmount = 100;
        if(!this.userService.selectHandle.atsignName) this.userService.selectHandle.atsignName = '';
        if(!this.userService.selectHandle.atsignType) this.userService.selectHandle.atsignType = 'paid';
        if(!this.userService.selectHandle.premiumHandleType) this.userService.selectHandle.atsignName = 'custom';
    }
    this.userService.stripePay(this.orderData).subscribe(
      res => {
        if (!res) {
          this.showErrorMessage = 'Something went wrong. Please try again after sometime.';
          this.SpinnerService.hide();
          this.disableSubmit = false;
        }
        else if (res['error']) {
          this.showErrorMessage = res['error']['message']||res['message'];
          this.SpinnerService.hide();
          this.disableSubmit = false;
        } else if (res['requiresAction']) {
          // Request authentication
          this.handleAction(res['clientSecret'],res['transactionId']);
        }else if (res['status']=='error') {
          this.showErrorMessage = res['message'];
          this.SpinnerService.hide();
          this.disableSubmit = false;
        } else {
          this.orderComplete(res['clientSecret']);
        }
      },
      err => {
        this.SpinnerService.hide();
        this.disableSubmit = false;
        if (err.error.message) {
          this.showErrorMessage = err.error.message;
        }
        else {
          this.showErrorMessage = "Something went wrong, please try again.";
        }
      });
  }

  //This metog is to checkout paid order
  async checkoutPaidCart(totalCartAmount, amountToBeDeductedFromCard, username, promotionalCode) {
    if (this.disableSubmit) {
      return;
    }
    this.showErrorMessage = '';
    this.SpinnerService.show();
    this.disableSubmit = true;
    let paymentMethodId = '';
    if (amountToBeDeductedFromCard > 0) {
      let billing_details = { 'name': username }
      if (this.userService.selectHandle.contact) {
        billing_details['phone'] = this.userService.selectHandle.contact;
      } else {
        billing_details['email'] = this.userService.selectHandle.email;
      }
      const result = await this.stripe.createPaymentMethod("card", this.cardNumber, { billing_details });
      if (result.error) {
        if (result.error.code === "incomplete_number")
        {
          this.showErrorMessage = "Oops, don't forget to enter your complete card number!";
        }
        else if (result.error.code === "incomplete_cvc") 
        {
          this.showErrorMessage = "Oops, don't forget to enter your CVC!";
        }
        else if (result.error.code === "incomplete_expiry")
        {
          this.showErrorMessage = "Oops, don't forget to enter your card expiry!";
        } 
        else if (result.error.code === "invalid_number")
        {
          this.showErrorMessage = "Oops,  please enter a valid card number!";
        }
        else if (result.error.param === "billing_details[name]") 
        {
          this.showErrorMessage = "Oops, don't forget to enter your name!";
        }
        else
        {
          this.showErrorMessage = result.error.message;
        }
        this.SpinnerService.hide();
        this.disableSubmit = false;
        return;
      } else {
        paymentMethodId = result.paymentMethod.id;
      }
    } else {
      paymentMethodId = '';
    }
    this.completePaidOrder(paymentMethodId,promotionalCode)
  }

  //Submit Form
  async onSubmit(form: NgForm) {
    //Total amount of order without discount
    const totalCartAmount = this.userService.selectHandle.subTotal;
    //Amount need to be deducted from Stripe Card.
    const amountToBeDeductedFromCard = this.calculateFinalAmount(this.userService.selectHandle.subTotal, this.userService.commercialAtsignDiscountPercentage, this.promoCardAmount)
    //Form Validation
    if (totalCartAmount > 0 && !this.checkoutTnC) return this.showErrorMessage = "Please check the Terms and Conditions box.";
    if (amountToBeDeductedFromCard > 0 && !form.value.username) return this.showErrorMessage = "Oops, don't forget to enter your name!";
    if (totalCartAmount > 0 && amountToBeDeductedFromCard == 0 && this.userService.commercialAtsignDiscountPercentage != 100 && !form.value.promotionalCode)
      return this.showErrorMessage = "Oops, don't remove your promotion code!";

    if (totalCartAmount === 0) { //Free only order
      this.checkoutFreeOnlyCart()
    } else { //Paid Order
      this.checkoutPaidCart(totalCartAmount, amountToBeDeductedFromCard, form.value.username, form.value.promotionalCode)
    }
  }

  saveAtsign() {
    let data = {};
    data['inviteCode'] = this.userService.selectHandle.inviteCode;
    data['cartData'] = this.userService.cartData;
    if (this.userService.cartData.length > 0) {
      this.userService.saveAtsign(data).subscribe(
        res => {
          if (res['status'] === 'error') {

            this.showErrorMessage = res['message'];

          }
          else {
            this.showSucessMessage = 'Saved Successfully.';
            this.userService.savedCartData = this.userService.cartData;
            this.router.navigateByUrl('/accountconfirmation');
          }

        },
        err => {
          if (err.status === 422) {
            this.showErrorMessage = err.error.join('<br/>');
          }
          else
            this.showErrorMessage = 'Something went wrong. Please try again.';
        }
      );
    } else {
      this.showErrorMessage = 'No @sign available in your cart. Please try again.';

    }

  }

  isTextOverflow(elementId) {
    let elem = document.getElementById(elementId);
    if (elem) {
      return (elem.offsetWidth < elem.scrollWidth);
    }
    else {
      return false;
    }
  }

  showAtsignName(atsignName) {
    this.fullAtsignName = atsignName;
  }

  async removeFromCart(data) {
    var index = this.userService.cartData.findIndex(obj => obj['atsignName'] === data.atsignName);
    this.userService.cartData.splice(index, 1);
    if (this.userService.cartData.length === 0) {
      this.userService.showTimer = false;
    }
    this.userService.selectHandle.subTotal -= data.payAmount;
    await this.userService.deleteReserveAtsign({ atsignName: data.atsignName }).toPromise();
  }
  confirmDelete(data): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '500px',
      data: { cartData: data }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event === 'Deleted') {
        this.removeFromCart(result.data.cartData)
      }
    });
  }
  async removePromoCode() {
    this.promoCardAmount = 0;
    this.disablePromoCode = false
    this.invalidPromoCode = false
    let amountAfterDiscount = this.userService.selectHandle['subTotal'] - ((this.userService.selectHandle['subTotal'] * this.userService.commercialAtsignDiscountPercentage) / 100);
    this.amountToBeDeductedFromPromoCard = this.promoCardAmount > amountAfterDiscount ? amountAfterDiscount : this.promoCardAmount
  }
  async applyPromoCode(promoCode){
    if(!promoCode){
      this.showErrorMessage = "Oops, please enter valid promotional code."
    }else{
      this.userService.applyPromoCode({promotionalCode:promoCode}).subscribe(res=>{
        if(res['status'] == 'success'){
          this._snackBar.open('Promotional Code applied successfully!', 'x', {
            duration: 15000,
            panelClass: ['custom-snackbar']
        });
            this.promoCardAmount = res["data"];
            this.disablePromoCode = true
            this.invalidPromoCode = false
            let amountAfterDiscount = this.userService.selectHandle['subTotal'] - ((this.userService.selectHandle['subTotal'] * this.userService.commercialAtsignDiscountPercentage)/100);
            this.amountToBeDeductedFromPromoCard = this.promoCardAmount > amountAfterDiscount ? amountAfterDiscount : this.promoCardAmount
        }else{
          this.promoCardAmount = 0;
          this.invalidPromoCode = true
          this.showErrorMessage = res["message"]
        }
      })
    
    }
    
    // this.userService.applyPromoCode()
  }

  calculateFinalAmount(subTotal,commercialAtsignDiscountPercentage,promoCardAmount){
    let amountAfterDiscount = subTotal - ((subTotal * commercialAtsignDiscountPercentage)/100);
    let amountAfterPromotion = amountAfterDiscount
    if(amountAfterDiscount - promoCardAmount >= 0){
      amountAfterPromotion = amountAfterDiscount - promoCardAmount
    }else{
      amountAfterPromotion = 0
      this.promoCardPendingAmount = promoCardAmount - amountAfterDiscount
    }
    return amountAfterPromotion;

  }


}