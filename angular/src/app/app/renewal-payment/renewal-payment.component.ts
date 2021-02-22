import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

import { NgForm } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from "@angular/router";
import { MatDialog } from '@angular/material/dialog';
import { TermsConditionComponent } from '../../terms-condition/terms-condition.component';
import { ConfirmationModalComponent } from '../../confirmation-modal/confirmation-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
declare var Stripe;

@Component({
  selector: 'app-renewal-payment',
  templateUrl: './renewal-payment.component.html',
  styleUrls: ['./renewal-payment.component.css']
})
export class RenewalPaymentComponent implements AfterViewInit, OnDestroy {
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
  nameOnCard :String = ''
  atSignsForRenewal :string[] = [];
  paymentConfirm:boolean=false
  constructor(private cd: ChangeDetectorRef, public userService: UserService,
    private SpinnerService: NgxSpinnerService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private router: Router) {
      console.log("aaaa")
    this.route.params.subscribe(params => {
      this.code = params["code"];
    });
    let state = this.router.getCurrentNavigation().extras.state;
    if(state) {
      this.atSignsForRenewal = state.atSignsForRenewal
    }

    if(this.atSignsForRenewal.length < 1){
      this.router.navigate(['/dashboard']);
    } 
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
  navigateToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  async ngAfterViewInit() {
      
      const { key }: any = await this.userService.getStripePublishKey().toPromise();
      this.stripe = Stripe(key);
      const elements = this.stripe.elements();

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
        this.orderData = {
          items: [{ id: "atsign-name" }],
          currency: "usd"
        };
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

  async orderComplete(clientSecret,orderComplete) {
    this.SpinnerService.show();
    this.disableSubmit = true;
    this.paymentConfirm = true
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


    this.userService.savedCartData = this.userService.cartData;
  }

  async handleAction(clientSecret, transactionId,orderData) {
    this.SpinnerService.show();
    this.disableSubmit = true;
    const data: any = await this.stripe.handleCardAction(clientSecret);
    if (data.error) {

      this.showErrorMessage = 'Your card was not authenticated, please try again';
      this.SpinnerService.hide();
      this.disableSubmit = false;
    } else if (data.paymentIntent.status === "requires_confirmation") {

      let response: any = await this.userService.renewalAtsignPay({ paymentIntentId: data.paymentIntent.id,  transactionId, clientSecret, ...orderData }).toPromise();
      if (response.error) {
        this.showErrorMessage = response.error;
        this.SpinnerService.hide();
        this.disableSubmit = false;
      } else if (response['status'] == 'error') {
        this.showErrorMessage = response['message'];
        this.SpinnerService.hide();
        this.disableSubmit = false;
      }
      else {
        this.orderComplete(clientSecret,orderData);
      }
    }
  }

  checkoutFreeOnlyCart() {
    this.saveAtsign();
    this.userService.savedCartData = this.userService.cartData;
    this.router.navigateByUrl('/accountconfirmation');
  }

  //Complete Paid order by deducting amount form card or promotional code
  async completePaidOrder(paymentMethodId, renewalAtsigns , totalCartAmount) {
    let orderData = {
      paymentMethodId : paymentMethodId,
      renewalAtsigns:renewalAtsigns,
    }
    
    this.orderData.user_id = this.userService.selectHandle.user_id || this.userId;
    
    this.userService.renewalAtsignPay(orderData).subscribe(
      res => {
        if (res['error']) {
          this.showErrorMessage = res['error']['message'] || res['message'];
          this.SpinnerService.hide();
          this.disableSubmit = false;
        } else if (res['requiresAction']) {
          // Request authentication
          this.handleAction(res['clientSecret'], res['transactionId'],orderData);
        } else if (res['status'] == 'error') {
          this.showErrorMessage = res['message'];
          this.SpinnerService.hide();
          this.disableSubmit = false;
        } else {
          this.orderComplete(res['clientSecret'],orderData);
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
  async checkoutPaidCart(renewalAtsigns, totalCartAmount, username) {
    if (this.disableSubmit) {
      return;
    }
    if (!this.checkoutTnC) {
      this.showErrorMessage = "Please check the Terms and Conditions box.";
      return;
    }
    this.showErrorMessage = '';
    this.SpinnerService.show();
    this.disableSubmit = true;
    let paymentMethodId = '';
    if (renewalAtsigns.length > 0) {
      let billing_details = { 'name': username }
      if (this.userService.selectHandle.contact) {
        billing_details['phone'] = this.userService.selectHandle.contact;
      } else {
        billing_details['email'] = this.userService.selectHandle.email;
      }
      const result = await this.stripe.createPaymentMethod("card", this.cardNumber, { billing_details });
      if (result.error) {
        if (result.error.code === "incomplete_number") this.showErrorMessage = "Oops, don't forget to enter your complete card number!";
        if (result.error.code === "incomplete_cvc") this.showErrorMessage = "Oops, don't forget to enter your CVC!";
        if (result.error.code === "incomplete_expiry") this.showErrorMessage = "Oops, don't forget to enter your card expiry!";
        if (result.error.param === "billing_details[name]") this.showErrorMessage = "Oops, don't forget to enter your name!";
        if(!this.showErrorMessage) this.showErrorMessage = result.error.message
        this.SpinnerService.hide();
        this.disableSubmit = false;
        return;
      } else {
        paymentMethodId = result.paymentMethod.id;
      }
    } else {
      this.showErrorMessage = "Oops, something went wrong";
      return 
    }
    this.completePaidOrder(paymentMethodId, renewalAtsigns , totalCartAmount)
  }

  async onSubmit(form: NgForm) {
    let renewalAtsigns = this.atSignsForRenewal
    const totalCartAmount = renewalAtsigns.length * 10;
    const amountToBeDeductedFromCard = totalCartAmount
    if (totalCartAmount > 0 && !form.value.username) return this.showErrorMessage = "Oops, don't forget to enter your name!";
    this.checkoutPaidCart(renewalAtsigns,totalCartAmount, form.value.username)
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
  async applyPromoCode(promoCode) {
    if (!promoCode) {
      this.showErrorMessage = "Oops, please enter valid promotional code."
    } else {
      this.userService.applyPromoCode({ promotionalCode: promoCode }).subscribe(res => {
        if (res['status'] == 'success') {
          this._snackBar.open('Promotional Code applied successfully!', 'x', {
            duration: 15000,
            panelClass: ['custom-snackbar']
          });
          this.promoCardAmount = res["data"];
          this.disablePromoCode = true
          this.invalidPromoCode = false
          let amountAfterDiscount = this.userService.selectHandle['subTotal'] - ((this.userService.selectHandle['subTotal'] * this.userService.commercialAtsignDiscountPercentage) / 100);
          this.amountToBeDeductedFromPromoCard = this.promoCardAmount > amountAfterDiscount ? amountAfterDiscount : this.promoCardAmount
        } else {
          this.promoCardAmount = 0;
          this.invalidPromoCode = true
          this.showErrorMessage = res["message"]
        }
      })

    }

    // this.userService.applyPromoCode()
  }

  calculateFinalAmount(subTotal, commercialAtsignDiscountPercentage, promoCardAmount) {
    let amountAfterDiscount = subTotal - ((subTotal * commercialAtsignDiscountPercentage) / 100);
    let amountAfterPromotion = amountAfterDiscount
    if (amountAfterDiscount - promoCardAmount >= 0) {
      amountAfterPromotion = amountAfterDiscount - promoCardAmount
    } else {
      amountAfterPromotion = 0
      this.promoCardPendingAmount = promoCardAmount - amountAfterDiscount
    }
    return amountAfterPromotion;

  }


}