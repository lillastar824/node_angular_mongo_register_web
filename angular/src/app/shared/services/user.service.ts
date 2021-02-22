import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Routes, RouterModule, Router, ActivatedRoute } from "@angular/router";
import { environment } from '../../../environments/environment';
import { User } from '../model/user';
import { Handle } from '../model/handle.model';
import * as CryptoJS from 'crypto-js';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class UserService {

  selectHandle = {
    atsignType: '',
    atsignName: '',
    email: '',
    contact: '',
    otp: null,
    foods: '',
    colors: '',
    animals: '',
    hobbies: '',
    music: '',
    sports: '',
    movies: '',
    numbers: '',
    renewDate: new Date(),
    premiumHandleType: '',
    inviteCode: '',
    payAmount: null,
    user_id: '',
    renewTime: '',
    subTotal: null
  };
  cartData = [];
  savedCartData = [];
  showTimer = false;
  commercialAtsignDiscountPercentage=0;
  homeEmail = '';
  standardHandlesLabels: string[] = ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4'];
  standardHandles: string[] = ['hobbies', 'movies', 'foods', 'music'];
  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };
  timeLeft: number;
  defaultTimeLeft = 1200;
  currentUserType = '';
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  dataFromAdmin: boolean = false;
  userLoggedIn = new EventEmitter();    
  userLoggedOut = new EventEmitter();    
  atSignSearchHistory: any = [];

  constructor(private http: HttpClient,private router: Router) {
    let current;
    try {
      current = JSON.parse(this.decryptAtsign(localStorage.getItem('currentUser')))
    } catch (err) {
      current = localStorage.getItem('currentUser')
    }
    this.currentUserSubject = new BehaviorSubject<User>(current);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  //HttpMethods

  postUser(user: User) {
    return this.http.post(environment.apiBaseUrl + '/register', user, this.noAuthHeader);
  }

  login(authCredentials) {
    return this.http.post(environment.apiBaseUrl + '/authenticate', authCredentials, this.noAuthHeader)
      .pipe(map(user => {
        const newUser = {
          id: user['user']['_id'],
          username: user['user']['email'],
          role: user['user']['userRole']
        };
        // login successful if there's a jwt token in the response
        if (user && user['token']) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', this.encryptAtsign(JSON.stringify(newUser)));
          this.currentUserSubject.next(newUser);
        }

        return user;
      }));
  }

  getUserProfile() {
    return this.http.get(environment.apiBaseUrl + '/userProfile');
  }

  getStripePublishKey() {
    return this.http.get(`${environment.apiBaseUrl}/stripepublishkey`);
  }

  stripePay(data) {
    return this.http.post(`${environment.apiBaseUrl}/pay`, data);
  }
  renewalAtsignPay(data) {
    return this.http.post(`${environment.apiBaseUrl}/renew-atsigns`, data);
  }
  applyPromoCode(data) {
    return this.http.post(`${environment.apiBaseUrl}/promotional-card-value`, data);
  }
  getInviteCode(user) {
    return this.http.post(`${environment.apiBaseUrl}/sendInvite`, user, this.noAuthHeader);

  }
  sendInviteLink(user) {
    return this.http.post(environment.apiBaseUrl + '/send-invite-link', user);
  }
  checkAtsignAvailability(atsignName: Handle) {

    //console.log(atsignName);
    let data = {};
    data['data'] = this.encryptAtsign(JSON.stringify(atsignName));
    return this.http.post(environment.apiBaseUrl + '/checkAtsignAvailability', data);
  }
  listSimilarAtSigns(atsignName) {
    return this.http.post(environment.apiBaseUrl + '/listSimilarAtSigns', atsignName);
  }
  saveAtsign(cartData) {
    return this.http.post(environment.apiBaseUrl + '/purchase-free-atsign-cart',cartData);
  }
  getAllUsers(data) {
    const params = data;
    return this.http.get(environment.apiBaseUrl + '/all-users', { params });
  }
  getUserDetails(user) {
    return this.http.post(environment.apiBaseUrl + '/getUserDetails', user)
    .pipe(map(user => {
      const newUser = {
        id: user['data']['user']['_id'],
        username: user['data']['user']['email'],
        role: user['data']['user']['userRole']
      };
      // login successful if there's a jwt token in the response
      if (user['data'] && user['data']['token']) {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentUser', this.encryptAtsign(JSON.stringify(newUser)));
        this.currentUserSubject.next(newUser);
      }

      return user;
    }));
  }
  sendVerificationCode(contact) {
    return this.http.post(environment.apiBaseUrl + '/sendVerificationCode', contact, this.noAuthHeader);
  }
  verifyContact(contact) {
    return this.http.post(environment.apiBaseUrl + '/verifyContact', contact, this.noAuthHeader)
      .pipe(map(user => {
        if(user && user['status'] !== 'error'){
        const newUser = {
          id: user['user']['_id'],
          username: user['user']['email'],
          role: user['user']['userRole']
        };
        // login successful if there's a jwt token in the response
        if (user && user['token']) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', this.encryptAtsign(JSON.stringify(newUser)));
          this.currentUserSubject.next(newUser);
        }
      }
        return user ;
      }));
  }
  cancelSubscription(contact) {
    return this.http.post(environment.apiBaseUrl + '/cancelSubscription', contact);
  }
  upgradeHandle(handle) {
    return this.http.post(environment.apiBaseUrl + '/upgradeHandle', handle);
  }

  reserveAtsign(atsign) {
    let data = {};
    data['data'] = this.encryptAtsign(JSON.stringify(atsign));
    return this.http.post(`${environment.apiBaseUrl}/reserve-atsign`, data);
  }

  fetchReserveAtsign(data) {
    return this.http.post(`${environment.apiBaseUrl}/fetchReserveAtsign`, data);
  }

  updateReserveAtsign(atsign) {
    let data = {};
    data['data'] = this.encryptAtsign(JSON.stringify(atsign));
    return this.http.put(`${environment.apiBaseUrl}/reserve-atsign`, data);
  }

  deleteReserveAtsign(data) {
    return this.http.post(`${environment.apiBaseUrl}/deleteReserveAtsign`, data);
  }
  viewHistory(contact) {
    return this.http.post(`${environment.apiBaseUrl}/viewHistory`, contact);
  }

  createNewHandle(email) {
    return this.http.post(`${environment.apiBaseUrl}/createNewHandle`, email);
  }

  checkPaidUser(data) {
    return this.http.get(`${environment.apiBaseUrl}/check-paid-user?atSignName=${data}`);
  }
  createInvites(data) {
    return this.http.post(`${environment.apiBaseUrl}/createInvites`, data);
  }
  createFriendUser(data) {
    return this.http.post(`${environment.apiBaseUrl}/send-invite/email`, data);
  }

  checkFriendInviteValid(data) {
    return this.http.post(`${environment.apiBaseUrl}/checkFriendInviteValid`, data, this.noAuthHeader);
  }
  deleteUser(data) {
    return this.http.post(`${environment.apiBaseUrl}/deleteUser`, data);
  }
  getInviteHistory() {
    return this.http.get(`${environment.apiBaseUrl}/inviteHistory`);
  }
  getAllAtsignOfCurrentUser() {
    return this.http.get(`${environment.apiBaseUrl}/user/atsign`);
  }

  getRandomatSign() {
    return this.http.get(`${environment.apiBaseUrl}/randomatSign`);
  }
  getRandomOptions() {
    return this.http.get(`${environment.apiBaseUrl}/getRandomOptions`);
  }
  getAllAtsigns(data) {
    const params = data;
    return this.http.get(`${environment.apiBaseUrl}/all-atsigns`, { params });
  }
  // commission atsign Api
  getAllCommissionAtsigns(data) {
    const params = data;
    return this.http.get(`${environment.apiBaseUrl}/commercial-atsign`, { params });
  }
  getAllCommissionReports(data) {
    const params = data;
    return this.http.get(`${environment.apiBaseUrl}/commission`, { params });
  }
  getCommercialReportsDetailsByAtsign(atsign, data) {
    const params = data;
    return this.http.get(`${environment.apiBaseUrl}/commission/reports/${atsign}`,{params});
  }
  addCommissionAtsigns(data) {
    return this.http.post(`${environment.apiBaseUrl}/commercial-atsign`, data);
  }
  deleteCommissionAtsigns(id) {
    return this.http.delete(`${environment.apiBaseUrl}/commercial-atsign/${id}`);
  }
  updateCommissionAtsign(data) {
    return this.http.put(`${environment.apiBaseUrl}/commercial-atsign`, data);
  }
  applycartReferalCode(data) {
    return this.http.post(`${environment.apiBaseUrl}/cart-referal-code`, data);
  }
  approveCommission(atsign){
    return this.http.post(`${environment.apiBaseUrl}/commission/approve`,{atsign})
  }
  
  atsignTransfer(data) {
    return this.http.post(`${environment.apiBaseUrl}/transfer-atsign`, data);
  }
  atsignTransferList(data) {
    const params = data;
    return this.http.get(`${environment.apiBaseUrl}/atsign-transfer-list`,{params});
  }
  getAllTransferAtsign(data) {
    const params = data;
    return this.http.get(`${environment.apiBaseUrl}/all-transfer-atsign`,{params});
  }
  updateTransferAtsignStatus(transferId, data) {
    return this.http.put(`${environment.apiBaseUrl}/transfer-atsign/${transferId}`, data);
  }
  resendTransferNotification(transferId) {
    return this.http.put(`${environment.apiBaseUrl}/resend-transfer-notification/${transferId}`, {});
  }
//================================================

  enableWaitList(data) {
    return this.http.post(`${environment.apiBaseUrl}/app-config/enable-waitlist`, data);
  }
  getAppConfig() {
    return this.http.get(`${environment.apiBaseUrl}/app-config`);
  }
  addReserveAtsigns(data) {
    return this.http.post(`${environment.apiBaseUrl}/add-reserve-atsign`, data);
  }
  updateSavedAtsign(data) {
    return this.http.post(`${environment.apiBaseUrl}/saved-atsign`, data);
  }
  deleteSavedAtsign(data) {
    return this.http.put(`${environment.apiBaseUrl}/saved-atsign`, data);
  }
  checkHealthStatus() {
    return this.http.get(`${environment.apiBaseUrl}/health`);
  }
  deleteStandardAtsign(data) {
    return this.http.post(`${environment.apiBaseUrl}/deleteStandardAtsign`, data);
  }
  freesignCount() {
    return this.http.get(`${environment.apiBaseUrl}/freesigncount`);
  }
  getUsersForReport(data,isCsv) {
    if(isCsv){
      return this.http.post(environment.apiBaseUrl + '/reports/user',data, { responseType: 'blob',observe: 'response' } );
    }else{
      return this.http.post(environment.apiBaseUrl + '/reports/user',data);
    }
  }

  getCartData(data) {
    return this.http.get(environment.apiBaseUrl+'/cart-atsign-data?notimestarted='+data+'&t='+Date.now());
  }

  // removereserved(data) {
  //   return this.http.post(environment.apiBaseUrl + '/removereserved', data);
  // }

  fetchUserLog(data) {
    return this.http.post(environment.apiBaseUrl + '/getuserlogs', data);
  }

  //Helper Methods
  addUser(user) {
    return this.http.post(environment.apiBaseUrl + '/create-user', user);
  }
  getUserDetailsFromCode(user) {
    return this.http.post(environment.apiBaseUrl + '/getUserDetailsFromCode', user, this.noAuthHeader);
  }
  saveProductNotification(data) {
    return this.http.post(environment.apiBaseUrl + '/saveProductNotification', data);
  }
  checkLoggedInUser() {
    return this.http.get(environment.apiBaseUrl + '/check-logged-in-user');
  }
  checkValidAtsign(data) {
    return this.http.post(environment.apiBaseUrl + '/check-valid-atsign', data);
  }
  changePassword(data) {
    return this.http.post(environment.apiBaseUrl + '/change-password', data);
  }
  logout() {
    return this.http.get(environment.apiBaseUrl + '/logout');
  }
  activateAtSign(data) {
    return this.http.post(environment.apiBaseUrl + '/activateAtSign', data);
  }
  deactivateAtSign(data) {
    return this.http.post(environment.apiBaseUrl + '/deactivateAtSign', data);
  }
  checkAtSignStatus(data) {
    return this.http.post(environment.apiBaseUrl + '/checkAtSignStatus', data);
  }
  checkActivateStatus(data) {
    return this.http.post(environment.apiBaseUrl + '/checkActivateStatus', data);
  }
  showQRCode(data) {
    return this.http.post(environment.apiBaseUrl + '/showQRCode', data);
  }
  getUserPaymentDetails() {
    return this.http.get(environment.apiBaseUrl + '/payments');
  }
  verificationSendOTP(data) {
    return this.http.post(environment.apiBaseUrl + '/verification-method/sendotp', data);
  }
  verificationVerifyOTP(data) {
    return this.http.post(environment.apiBaseUrl + '/verification-method/verify', data);
  }

  checkLastVerification() {
    return this.http.get(environment.apiBaseUrl + '/checkLastVerification');
  }
  sendNewInviteLink() {
    return this.http.get(environment.apiBaseUrl + '/sendNewInviteLink');
  }

  removeContact() {
    return this.http.post(environment.apiBaseUrl + '/removecontact' , {})
  }
  //Helper Methods

  setToken(token: string) {
    localStorage.setItem('token', token);
    this.userLoggedIn.emit(token);
  }
  
  getToken() {
    return localStorage.getItem('token');
  }
  
  deleteToken() {
    return new Promise((resolve, reject) => {
      this.logout().subscribe(res => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.userLoggedOut.emit();
        resolve();
      });
    });
  }

  getUserPayload() {
    const token = this.getToken();
    if (token) {
      const userPayload = atob(token.split('.')[1]);
      return JSON.parse(userPayload);
    } else {
      return null;
    }
  }

  isLoggedIn() {
    const userPayload = this.getUserPayload();
    if (userPayload) {
      return userPayload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  encryptAtsign(text) {
    const ciphertext = CryptoJS.AES.encrypt(text, environment.CRYPTO_KEY).toString();
    // //console.log(ciphertext)
    // this.decryptAtsign(ciphertext);
    return ciphertext;
  }
  decryptAtsign(ciphertext) {
    var bytes = CryptoJS.AES.decrypt(ciphertext, environment.CRYPTO_KEY);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    // //console.log(originalText,"originalText");
    return originalText;
  }
  createNewHande(email, contact) {
    let searchObject = {};
    if (email) {
      searchObject['email'] = email;
    } else {
      searchObject['contact'] = contact;
    }
    this.createNewHandle(searchObject).subscribe(res => {
      this.selectHandle['inviteCode'] = res['user']['inviteCode'];
      this.selectHandle.payAmount = 100;
      this.selectHandle.atsignName = '';
      this.selectHandle.atsignType = 'paid';
      this.selectHandle.subTotal = 0;
      // this.cartData = [];
      this.selectHandle.premiumHandleType = 'custom';
    }, err => {
      //console.log(err);
    });
  }
  getCommercialAtsignByUser(data) {
    const params = data;
    return this.http.get(`${environment.apiBaseUrl}/get-commercial-atsign`, { params });
  }
  createAnotherSign(email,contact,isRedirectedFromPaymentPage?) {
    let searchObject = {};
    if (email) {
        searchObject['email'] = email;
    } else {
        searchObject['contact'] = contact;
    }

        this.createNewHandle(searchObject).subscribe(res =>{
        let inviteCode =res['user']['inviteCode'];
            this.selectHandle.payAmount = 100;
            this.selectHandle.atsignName = '';
            this.selectHandle.atsignType = 'paid';
            this.selectHandle.subTotal = 0;
            // this.cartData = [];
            this.selectHandle.premiumHandleType = 'custom';
            let initialRoute = '/premium-sign/';
            // if(res['user']['atsignType'] === 'reserved'){
            //     initialRoute = '/premium-sign/';
            // }
            if(isRedirectedFromPaymentPage){
              this.router.navigateByUrl(initialRoute + inviteCode,{replaceUrl: true});
            }else{
              this.router.navigateByUrl(initialRoute + inviteCode);
            }
        },err=>{
            //console.log(err);
        });
    }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }
  public get cartLength() {
    return this.cartData.length;
  }
  
  checkInviteCodeValid(params) {
    return this.http.get(environment.apiBaseUrl +'/checkInviteCodeValid?inviteCode='+params,this.noAuthHeader);
  }

  assignAtsign(data) {
    return this.http.post(environment.apiBaseUrl + '/admin/assign-atsign', data);
  }

  getAllAssignedAtsigns(params) {
    return this.http.get(environment.apiBaseUrl + '/admin/assign-atsign', { params });
  }


}
