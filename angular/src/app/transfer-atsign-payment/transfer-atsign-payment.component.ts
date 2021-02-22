import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from '../shared/services/user.service';
declare var Stripe;

@Component({
  selector: 'app-transfer-atsign-payment',
  templateUrl: './transfer-atsign-payment.component.html',
  styleUrls: ['./transfer-atsign-payment.component.css']
})
export class TransferAtsignPaymentComponent implements OnInit {
  @ViewChild('cardNumberElement', { static: false }) cardNumberElement: ElementRef;
  @ViewChild('cardExpiryElement', { static: false }) cardExpiryElement: ElementRef;
  @ViewChild('cardCvcElement', { static: false }) cardCvcElement: ElementRef;

  card: any;
  cardNumber: any;
  cardExpiry: any;
  cardCvc: any;
  error: string;
  stripe: any;
  orderData: any;
  price: number;
  showSucessMessage: string;
  showErrorMessage: string;
  code: string;
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
  transferAtsign: any;
  paymentConfirm:boolean=false
  cardAtsign = this.onChange.bind(this);
  constructor(private router: Router, 
    private cd: ChangeDetectorRef, 
    public userService: UserService,
    private SpinnerService: NgxSpinnerService
    ) {
    let state = this.router.getCurrentNavigation().extras.state;
    if(state) {
      this.transferAtsign = state.transferAtsign
    }

    if(!this.transferAtsign){
      this.navigateToDashboard()
    }
   }

  ngOnInit() {
  }

  navigateToDashboard() {
    this.router.navigateByUrl('/dashboard',{replaceUrl:true});
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

  async onSubmit(form: NgForm) {
    let transferAtsign = this.transferAtsign
    const totalCartAmount = 50
    if (totalCartAmount > 0 && !form.value.username) return this.showErrorMessage = "Oops, don't forget to enter your name!";
    this.checkoutPaidCart(transferAtsign,totalCartAmount, form.value.username)
  }

  async checkoutPaidCart(transferAtsign, totalCartAmount, username) {
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
    if (transferAtsign) {
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
    this.completePaidOrder(paymentMethodId, transferAtsign , totalCartAmount)
  }

  async completePaidOrder(paymentMethodId, transferAtsign , totalCartAmount) {
    let orderData = {
      paymentMethodId : paymentMethodId,
      status : 'APPROVED'
    }
    
    this.orderData.user_id = this.userService.selectHandle.user_id || this.userId;
    
    this.userService.updateTransferAtsignStatus(transferAtsign._id, orderData).subscribe(
      res => {
        if (res['error']) {
          this.showErrorMessage = res['error']['message'] || res['message'];
          this.SpinnerService.hide();
          this.disableSubmit = false;
        } else if (res['requiresAction']) {
          // Request authentication
          this.handleAction(res['clientSecret'], transferAtsign._id,orderData);
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

  async handleAction(clientSecret, transactionId,orderData) {
    this.SpinnerService.show();
    this.disableSubmit = true;
    const data: any = await this.stripe.handleCardAction(clientSecret);
    if (data.error) {

      this.showErrorMessage = 'Your card was not authenticated, please try again';
      this.SpinnerService.hide();
      this.disableSubmit = false;
    } else if (data.paymentIntent.status === "requires_confirmation") {

      let response: any = await this.userService.updateTransferAtsignStatus(transactionId,{ paymentIntentId: data.paymentIntent.id,  transactionId, clientSecret, ...orderData }).toPromise();
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

}
