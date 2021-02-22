import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Routes, RouterModule, Router, ActivatedRoute } from "@angular/router";
import { UserService } from '../../shared/services/user.service';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SimilarSignInComponent } from '../../user/similar-sign-in/similar-sign-in.component';
import { NgxSpinnerService } from "ngx-spinner";
import { ConfirmationModalComponent } from '../../confirmation-modal/confirmation-modal.component';
import { UtilityService } from '../../shared/services/utility.service';
import { InterstitialLoaderService } from 'src/app/shared/services/interstitial-loader.service';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
@Component({
    selector: 'app-premium-signin',
    templateUrl: './premium-signin.component.html',
    styleUrls: ['./premium-signin.component.css']
})
export class PremiumSigninComponent implements OnInit {
    pricingDrawerExpanded: boolean = true;
    email: string;
    code: string;
    inviteCode: string;
    upgradeHandle: boolean = false;
    user: Object = {};
    atsignSuccessMessage: string;
    atsignErrorMessage: string;
    showSucessMessage: string;
    showErrorMessage: string;
    serverErrorMessages: string;
    atsignName: string;
    atsignPrice: number;
    // payAmount: number = 100;
    atsignNameError: boolean = false;
    userDetails;
    showTimer: boolean = false;
    showEmojiPicker: boolean = false;
    premiumType: string = 'Custom';
    specialCharError: string = null;
    cartData: object[] = [];
    premiumHandleType: string;
    fullAtsignName: string;
    placeholderText: string = 'Example: superstart';
    showInfo: boolean = false;
    focusActive: boolean = false;
    indexvalue: number;
    noSimilarSign: boolean;
    originalAtsignName : string = '';
    @ViewChild('premiumSignForm', { static: true }) public userFrm: NgForm;
    @ViewChild('atSignInput', { static: true }) atSignInput: ElementRef;
    hybridMessage: string;
    showSuggestionBox: boolean;
    paramsContact: string;

    constructor(public userService: UserService,
        private route: ActivatedRoute,
        private SpinnerService: NgxSpinnerService,
        private router: Router,
        public dialog: MatDialog,
        public utilityService: UtilityService,
        private interstitialLoaderService :InterstitialLoaderService,
        private _snackBar: MatSnackBar) {
        this.showSucessMessage = "";
        this.userService.showTimer = this.userService.showTimer ? this.userService.showTimer : false;
        this.route.params.subscribe((params) => {
          this.inviteCode = params["inviteCode"];
          if (params.code) {
            this.inviteCode = params.code;
          }
          if (params.id) {
            this.paramsContact = params.id;
          }
        });
        this.userService.selectHandle['atsignType'] = 'paid';
        this.userService.selectHandle.subTotal = this.userService.selectHandle.subTotal ? this.userService.selectHandle.subTotal : 0;
        this.userService.selectHandle.payAmount = this.userService.selectHandle.payAmount ? this.userService.selectHandle.payAmount : 100;
        this.userService.selectHandle.premiumHandleType = this.userService.selectHandle.premiumHandleType ? this.userService.selectHandle.premiumHandleType : 'custom'
        this.userService.selectHandle.atsignName = this.userService.selectHandle.atsignName ? this.userService.selectHandle.atsignName : '';
        if (this.userService.cartData.length > 0) {
            this.userService.showTimer = true;
        }
    }
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if ((Array.from(document.getElementsByClassName('emojiPicker')[0].querySelectorAll('*')).indexOf(<HTMLInputElement>event.target) === -1 && event.target != document.getElementsByClassName('emoji-icon')[0] && event.target != document.getElementsByClassName('emoji-box')[0]) && this.showEmojiPicker) {
            this.showEmojiPicker = false;
        }
        if(event.target['innerText'] !== 'History')
        {
            this.showSuggestionBox = false;
        }
        
    }
    ngOnInit() {
        const token = this.userService.getToken();
        this.userService.getUserDetails({ inviteCode: this.inviteCode }).subscribe(
            async res => {
                if (res['status'] === "success") {
                    if(token === null && res['data']['user'].userStatus === "Active")
                    {
                        this.router.navigateByUrl("/login");
                        return;
                    }
                    this.userService.setToken(res['data']['token']);
                    this.userDetails = res['data']['user'];
                    this.userService.currentUserType = 'user';
                    this.indexvalue = this.userDetails['atsignDetails'].length - 1;
                    // this.userService.selectHandle['atsignType'] = this.userDetails['atsignDetails'][this.indexvalue]['atsignType'];
                    // this.userService.selectHandle['atsignName'] = this.userDetails['atsignDetails'][this.indexvalue]['atsignName'];
                    this.userService.selectHandle['atsignType'] = 'paid';
                    this.userService.selectHandle['atsignName'] = '';
                    if (this.userDetails.userStatus === "Invited") {
                      if (
                        !this.userDetails["contact"] &&
                        !this.userDetails["email"]
                      ) {
                        window.location.href = "https://atsign.com/";
                      }
                      if (this.paramsContact) {
                        this.userService.sendNewInviteLink().subscribe(
                          async (res) => {
                            if (res["status"] === "success") {
                              this._snackBar.open(
                                "Your link has been expired. Someone from support team will help you.",
                                "x",
                                {
                                  duration: 15000,
                                  panelClass: ["custom-snackbar"],
                                }
                              );
                              setTimeout(() => {
                                this.router.navigateByUrl("/login");
                              }, 5000);
                            }
                          },
                          (err) => {
                            // console.log(err);
                            this.router.navigateByUrl("/login");
                          }
                        );
                      }
                    }
                    this.userService.selectHandle['contact'] = this.userDetails['contact'];
                    this.userService.selectHandle['email'] = this.userDetails['email'];
                    this.userService.selectHandle['inviteCode'] = this.inviteCode;
                    this.userService.selectHandle['user_id'] = this.userDetails['_id'];

                this.userService.dataFromAdmin = false;
                this.userService.currentUserType = 'user';
                this.userService.setToken(res['data']['token']);
                this.userDetails = res['data']['user'];
                let atSign = this.userDetails['atsignDetails'].find(o => o.inviteCode === this.inviteCode);
                if (!atSign) {
                    // this.router.navigateByUrl('/login');
                    return;
                }

                if (this.userDetails['atsignDetails'].length != 0) {
                    let atSignNameToSearch = '';
                    if (this.userDetails['atsignDetails'].find(o => o.inviteCode === this.inviteCode)) {
                        atSignNameToSearch = this.userDetails['atsignDetails'].find(o => o.inviteCode === this.inviteCode).atsignName;
                    } else {
                        atSignNameToSearch = this.userDetails['atsignDetails'].find(o => o.inviteCode.indexOf(this.inviteCode) !== -1).atsignName;
                    }
                    if (!this.upgradeHandle && atSignNameToSearch) {
                        const data = await this.userService.checkPaidUser(atSignNameToSearch).toPromise();
                        if (data['message'] === "paid") {
                            // this.router.navigateByUrl('/login');
                        } else {
                            for (let i = 0; i < this.userDetails['atsignDetails'].length; i++) {
                                if (this.userDetails['atsignDetails'][i]['inviteCode'].indexOf(this.inviteCode) !== -1) {
                                    this.userService.cartData.push({
                                        'atsignName': this.userDetails['atsignDetails'][i]['atsignName'],
                                        'payAmount': this.userDetails['atsignDetails'][i]['payAmount'],
                                        'premiumHandleType': 'Reserved'
                                    })
                                    this.userService.selectHandle['subTotal'] += this.userDetails['atsignDetails'][i]['payAmount'];
                                    this.userService.dataFromAdmin = true;
                                }
                            }
                            this.cleanUpCart();
                        }
                    } else {
                        this.userService.selectHandle['atsignName'] = atSignNameToSearch;
                    }
                }
                this.userService.selectHandle['atsignType'] = this.userDetails['atsignType'] ? this.userDetails['atsignType'] : 'paid';
                this.userService.selectHandle['contact'] = this.userDetails['contact'];
                this.userService.selectHandle['email'] = this.userDetails['email'];
                this.userService.selectHandle['inviteCode'] = this.inviteCode;
                this.userService.selectHandle['user_id'] = this.userDetails['_id'];
                this.userService.selectHandle.premiumHandleType = this.userDetails['premiumHandleType'] ? this.userDetails['premiumHandleType'] : 'custom'
            } else {
                // this.router.navigateByUrl('/login');
            }
        },
            err => {
                // console.log(err);
                this.router.navigateByUrl('/login');
            }
        );
    }

    restrictionsPopup() {
        var popup = document.getElementById("myPopup");
        popup.classList.toggle("show");
      }

    ngAfterViewInit() {
        fromEvent(this.atSignInput.nativeElement, 'keyup')
            .pipe(
                debounceTime(2000),
                distinctUntilChanged(),
                tap((e: any) => {
                    this.showInfo = false;
                    if (this.atSignInput.nativeElement.value.length > 2 && e.which !== 13) {
                        this.checkAtsignAvailability(this.userFrm, '');
                    }
                })
            )
            .subscribe();
    }
    openDialog(type): void {
        const dialogRef = this.dialog.open(SimilarSignInComponent, {
            width: '500px',
            data: {}
        });
        dialogRef.afterClosed().subscribe(result => {
            this.showInfo = false;
            this.atsignSuccessMessage = '';
            this.atsignErrorMessage = '';
            this.checkAtsignAvailability(this.userFrm, '');
            console.log('The dialog was closed');
        });
    }
    toggleEmojiPicker() {
        this.showEmojiPicker = !this.showEmojiPicker;
    }
    addEmoji(event) {
        const text = `${event.emoji.native}`;
        this.insertAtCaret('sign', text)
        // this.userService.selectHandle.atsignName = (this.userService.selectHandle.atsignName ? this.userService.selectHandle.atsignName : '') + text;
        // this.showEmojiPicker = false;
        this.atsignSuccessMessage = '';
        this.atsignErrorMessage = '';
        this.hybridMessage = '';
        this.checkAtsignAvailability(this.userFrm, '');
    }
    insertAtCaret(areaId, text) {
        var el = document.getElementById(areaId);
        const txtarea: HTMLInputElement = <HTMLInputElement>el;
        const doc = document as any;
        var scrollPos = txtarea.scrollTop;
        var strPos = 0;
        var br = ((txtarea.selectionStart || txtarea.selectionStart == 0) ?
            "ff" : (doc.selection ? "ie" : false));
        if (br == "ie") {
            txtarea.focus();
            var range = doc.selection.createRange();
            range.moveStart('character', -txtarea.value.length);
            strPos = range.text.length;
        }
        else if (br == "ff") strPos = txtarea.selectionStart;

        var front = (txtarea.value).substring(0, strPos);
        var back = (txtarea.value).substring(strPos, txtarea.value.length);
        txtarea.value = front + text + back;
        strPos = strPos + text.length;
        if (br == "ie") {
            txtarea.focus();
            var range = doc.selection.createRange();
            range.moveStart('character', -txtarea.value.length);
            range.moveStart('character', strPos);
            range.moveEnd('character', 0);
            range.select();
        }
        else if (br == "ff") {
            txtarea.selectionStart = strPos;
            txtarea.selectionEnd = strPos;
            txtarea.focus();
        }
        txtarea.scrollTop = scrollPos;
        this.userService.selectHandle.atsignName = txtarea.value;
    }

    paidType(type) {
        this.atsignErrorMessage = '';
        if (type === 'custom') {
            this.premiumType = 'Custom';
            this.userService.selectHandle.payAmount = 100;
            this.placeholderText = 'Example: superstart';
        }
        if (type === 'singleWord') {
            this.premiumType = 'Single Word';
            this.userService.selectHandle.payAmount = 1000;
            this.placeholderText = 'Example: robert, apple, sarah';
        }
        if (type === 'threeChar') {
            this.premiumType = 'Three Character';
            this.userService.selectHandle.payAmount = 5000;
            this.placeholderText = 'Example: ETC, NBA';
            if (this.userService.selectHandle.atsignName && this.utilityService.atSignWithEmojiLength(this.userService.selectHandle.atsignName) > 3) {
                this.atsignErrorMessage = 'More than three characters are not allowed';
                this.userService.selectHandle.atsignName = '';
            }
        }
        this.showInfo = true;
        this.atsignSuccessMessage = '';
    }

    onKeyPressHandle(event) {
        this.showInfo = false;
        this.atsignSuccessMessage = '';
        this.atsignErrorMessage = '';
        this.originalAtsignName = '';
        this.hybridMessage = '';
        this.showSuggestionBox = false;
        this.specialCharError = event;
    }

    checkAtsignAvailability(form: NgForm, type) {
        if(this.userService.atSignSearchHistory.length === this.utilityService.searchHistoryCount) {
            this.userService.atSignSearchHistory.splice(0, 1);
        }
        if(!this.userService.selectHandle.atsignName)
        {
            return;
        }
        this.userService.selectHandle.atsignName = this.userService.selectHandle.atsignName.replace(/\s/g, '');
        if (this.userService.atSignSearchHistory.indexOf(this.userService.selectHandle.atsignName) === -1) {
            this.userService.atSignSearchHistory.push(this.userService.selectHandle.atsignName);
        }
        this.showInfo = false;
        // this.userService.cartData = [];
        this.specialCharError = null;
        this.SpinnerService.show();
        this.atsignSuccessMessage = '';
        this.atsignErrorMessage = '';
        this.serverErrorMessages = '';
        this.showSuggestionBox = false;
        form.value['atsignType'] = 'paid';
        form.value['atsignName'] = this.userService.selectHandle.atsignName.replace(/\s/g, '');
        if (form.value.atsignName && form.value.atsignName.length > 2) {
            const lowerCaseAtsign = form.value.atsignName.toLowerCase();
            if (this.userService.cartData.some(cartData => cartData.atsignName.toLowerCase() === lowerCaseAtsign)) {
                this.serverErrorMessages = "Bummer! This @sign is already in your cart!";
                this.SpinnerService.hide();
                return;
            }
            form.value['inviteCode'] = this.inviteCode;
            if(type === 'hybrid'){
                form.value['type'] = type;
            }
            this.userService.checkAtsignAvailability(form.value).subscribe(
                res => {
                    //   this.showSucessMessage = true;
                    if(!res)
                    {
                        this.serverErrorMessages = 'Something went wrong. Please try again later.';
                    }
                    else if (res['status'] === 'success') {
                        this.userService.selectHandle.premiumHandleType = res['data']['premiumHandleType'];
                        this.paidType(res['data']['premiumHandleType'])
                        this.userService.selectHandle.payAmount = res['data']['price'];
                        this.atsignName = form.value.atsignName;
                        if (res['data']['price']) {
                            this.atsignPrice = res['data']['price'];

                            this.atsignSuccessMessage = `${res['message']} at $${res['data']['price']}`;
                        } else {
                            this.atsignSuccessMessage = res['message'];
                        }
                    } else {
                        this.atsignErrorMessage = res['message'];
                    }
                    this.SpinnerService.hide();
                },
                err => {
                    if (err.status === 422) {
                        this.serverErrorMessages = err.error.join('<br/>');
                    }
                    else
                        this.serverErrorMessages = 'Something went wrong. Please contact admin.';
                    this.SpinnerService.hide();
                }
            );
        }
        else {
            this.SpinnerService.hide();
            this.atsignErrorMessage = 'Bummer! @sign should have at least 3 characters!';
        }
    }

    async addToCart(form: NgForm) {
        this.interstitialLoaderService.show({ svg: 'addbag', message: 'Adding to bag…' });
        this.showInfo = false;
        this.userService.showTimer = false;
        if (form.value.premiumHandleType === 'custom') {
            this.premiumHandleType = 'Custom';
        }
        if (form.value.premiumHandleType === 'singleWord') {
            this.premiumHandleType = 'Single';
        }
        if (form.value.premiumHandleType === 'threeChar') {
            this.premiumHandleType = 'Three';
        }
        var data = {
            "atsignName": form.value.atsignName.replace(/\s/g, ''),
            "premiumHandleType": this.premiumType,
            "payAmount": this.userService.selectHandle.payAmount,
        }

        this.userService.updateReserveAtsign({ atsignName: this.userService.selectHandle.atsignName, cart: this.userService.cartData, type: 'timestamp' }).subscribe(
            res => {
                this.userService.cartData.push(data);
                this.userService.selectHandle.subTotal += this.userService.selectHandle.payAmount;
                this.userService.selectHandle.atsignName = '';
                this.atsignSuccessMessage = '';
                this.hybridMessage = '';
                this.userService.showTimer = true;
                this.userService.timeLeft = this.userService.defaultTimeLeft;
                setTimeout(() => {
                    this._snackBar.open(
                        "@sign added to cart.",
                        "x",
                        {
                          duration: 5000,
                          panelClass: ["custom-snackbar"],
                        }
                      );
                  }, 3000);
                
            }, err => {
                this.atsignSuccessMessage = '';
                this.atsignErrorMessage = "Bummer! This @sign is not available anymore!";
            }
        );
    }

    // async removeFromCart(data) {
    //     var index = this.userService.cartData.findIndex(obj => obj['atsignName'] === data.atsignName);
    //     this.userService.cartData.splice(index, 1);
    //     if (this.userService.cartData.length === 0) {
    //         this.userService.showTimer = false;
    //     }
    //     this.userService.selectHandle.subTotal -= data.payAmount;
    //     await this.userService.deleteReserveAtsign({ atsignName: data.atsignName }).toPromise();
    // }
    // confirmDelete(data): void {
    //     const dialogRef = this.dialog.open(ConfirmationModalComponent, {
    //         width: '500px',
    //         data: { cartData: data }
    //     });
    //     dialogRef.afterClosed().subscribe(result => {
    //         if (result && result.event === 'Deleted') {
    //             this.removeFromCart(result.data.cartData)
    //         }
    //     });
    // }
    clearAtsign() {
        this.userService.selectHandle.atsignName = '';
        this.atsignName = '';
        this.atsignSuccessMessage = '';
        this.atsignErrorMessage = '';
        this.serverErrorMessages = '';
        this.showInfo = false;
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
    // async register() {
    //     if (this.userService.dataFromAdmin) {
    //         this.userService.updateReserveAtsign({ atsignName: this.userService.selectHandle.atsignName, cart: this.userService.cartData, type: 'timestamp' }).subscribe(
    //             res => {
    //                 if (this.userService.cartData.length > 0) {
    //                     this.router.navigateByUrl('/account-verify/' + this.inviteCode);
    //                 }
    //             }, err => {
    //                 this.serverErrorMessages = "@sign not available";
    //             }
    //         );
    //     }
    //     else {
    //         this.router.navigateByUrl('/account-verify/' + this.inviteCode);
    //     }
    // }

    cleanUpCart() {
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
    convertToTen() {
        this.interstitialLoaderService.show({ svg: 'atom', message: 'Splitting atoms…' });
        let atSign = this.userService.selectHandle.atsignName.indexOf(this.originalAtsignName) !== -1 && this.originalAtsignName.length > 0 ? this.originalAtsignName : this.userService.selectHandle.atsignName
        this.userService.listSimilarAtSigns({ handle: atSign , maketen: true }).subscribe(
            res => {
                if (res['status'] === 'success') {
                    let response = res['data'];
                    if (response.length > 0) {
                        this.originalAtsignName = response[0].originalAtSign;
                        this.userService.selectHandle.atsignName = response[0].atsignName;
                        this.userService.selectHandle.payAmount = 10;
                        this.userFrm.value.atsignName = response[0].atsignName;
                        this.atsignSuccessMessage = `${response[0].atsignName} is availiable at $10`;
                        this.atsignNameError = false; 
                        this.atsignErrorMessage = '';
                        this.hybridMessage = '@sign successfully hybridized!';
                        if(this.userService.atSignSearchHistory.length === this.utilityService.searchHistoryCount) {
                            this.userService.atSignSearchHistory.splice(0, 1);
                        }
                        this.userService.selectHandle.atsignName = this.userService.selectHandle.atsignName.replace(/\s/g, '');
                        if (this.userService.atSignSearchHistory.indexOf(this.userService.selectHandle.atsignName) === -1) {
                            this.userService.atSignSearchHistory.push(this.userService.selectHandle.atsignName);
                        }
                    } else {
                        this.noSimilarSign = true;
                    }
                } else {
                    this.atsignNameError = true;
                }
            },
            err => {
                this.atsignNameError = true;
            }
        );
    }
    checkFreeCount(){
        this.userService.freesignCount().subscribe(res => {
            if (res['status'] === "success") {
                this.userService.selectHandle['atsignType'] = 'free';
                this.router.navigateByUrl('/standard-sign/' + this.inviteCode);
            }
            else {
                this.serverErrorMessages = "Sorry you are limited to "+ this.utilityService.freeAtSign +" free @signs. You can have unlimited premium @signs."
            }
        });
    }

    createAnotherSign() {
        this.userService.createAnotherSign(this.userDetails['email'], this.userDetails['contact']);
        this.atsignErrorMessage = '';
        this.serverErrorMessages = '';
    }
}
