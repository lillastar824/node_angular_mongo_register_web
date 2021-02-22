// built-in
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
// components
import { AppComponent } from "./app.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { ButtonsModule } from "ngx-bootstrap/buttons";

import { UserComponent } from "./user/user.component";
import { SignUpComponent } from "./user/sign-up/sign-up.component";
//routes
import { appRoutes } from "./routes";
import { UserProfileComponent } from "./user-profile/user-profile.component";
import { SignInComponent } from "./user/sign-in/sign-in.component";
import { UserService } from "./shared/services/user.service";
import { ReportService } from "./reports/reports.service";
import { NumberDirective } from "./shared/directives/numbers-only.directive";
import { PreventDoubleClickDirective } from "./shared/directives/preventdoubleclick.directive";
import { PhoneMaskDirective } from "./shared/directives/phone-mask.directive";
//other
import { AuthGuard } from "./auth/auth.guard";
import { AuthInterceptor } from "./auth/auth.interceptor";
import { HomeComponent } from "./home/home.component";
import { ShowUsersComponent } from "./show-users/show-users.component";
import { RegisterComponent } from "./user/register/register.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { DemoMaterialModule } from "./material-module";
import { CountdownModule,CountdownGlobalConfig } from "ngx-countdown";
import { EmojiModule } from "angular-emoji/dist";
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { CheckoutComponent } from "./checkout/checkout.component";
import { NgxSpinnerModule } from "ngx-spinner";
import { NavbarComponent } from "./navbar/navbar.component";
import { StandardSignComponent } from "./user/standard-sign/standard-sign.component";
import { AccountVerifyComponent } from "./user/account-verify/account-verify.component";
import { AccountConfirmationComponent } from "./user/account-confirmation/account-confirmation.component";
import { InviteLinkComponent } from "./invite-link/invite-link.component";
import { SimilarSignInComponent } from "./user/similar-sign-in/similar-sign-in.component";
import { PremiumSigninComponent } from "./user/premium-signin/premium-signin.component";
import { TermsConditionComponent } from "./terms-condition/terms-condition.component";
import { ModalDialogComponent } from "./modal-dialog/modal-dialog.component";
import { PolicyComponent } from "./policy/policy.component";
import { CookieService } from "ngx-cookie-service";
import { AboutComponent } from "./about/about.component";
import { FaqComponent } from "./faq/faq.component";
import { TermsComponent } from "./terms/terms.component";
import { ConfirmationModalComponent } from "./confirmation-modal/confirmation-modal.component";
import { ReservedAtsignsComponent } from "./reserved-atsigns/reserved-atsigns.component";
import { HomeCommonComponent } from "./home-common/home-common.component";
import { ProductInfoComponent } from "./product-info/product-info.component";
import { HealthCheckupComponent } from "./health-checkup/health-checkup.component";
import { DevelopersComponent } from "./developers/developers.component";
import { PickasignComponent } from "./pickasign/pickasign.component";
import { WelcomeComponent } from "./welcome/welcome.component";
import { ReportsComponent } from "./reports/reports.component";
import { CareerComponent } from "./career/career.component";
import { VerificationCodeComponent } from "./verification-code/verification-code.component";
import { UserLogComponent } from "./user-log/user-log.component";
import { DeviceDetectorModule } from "ngx-device-detector";
// import { ParticlesModule } from 'angular-particle';
import { Ng2TelInputModule } from "ng2-tel-input";
import { ChartsModule,BaseChartDirective,ThemeService } from "ng2-charts";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { CareersComponent } from "./careers/careers.component";
import { BottomSheetComponent } from "./bottom-sheet/bottom-sheet.component";
import { ActivateAtsignComponent } from "./activate-atsign/activate-atsign.component";
import { environment } from "../environments/environment";
// store
import { EffectsModule } from "@ngrx/effects";
import { UserEffect } from "./shared/effects/user.effects";
import { StoreModule } from "@ngrx/store";
import { Store } from "@ngrx/store";
import { UserReducer } from "./shared/reducers/user.reducers";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { ShoppingCartEmptyDialogComponent } from "./shopping-cart-empty-dialog/shopping-cart-empty-dialog.component";
import { InterstitialLoaderComponent } from "./interstitial-loader/interstitial-loader.component";
import { InviteHistoryDialogComponent } from "./invite-history-dialog/invite-history-dialog.component";
import { ShoppingCartDialogComponent } from "./shopping-cart-dialog/shopping-cart-dialog.component";
import { InterstitialLoaderService } from "./shared/services/interstitial-loader.service";
import { InviteShareableLinkDialogComponent } from "./invite-shareable-link-dialog/invite-shareable-link-dialog.component";
import { PurchasedSignsModalComponent } from "./purchased-signs-modal/purchased-signs-modal.component";
import { PurchaseHistoryDialogComponent } from "./purchase-history-dialog/purchase-history-dialog.component";
import { VerificationMethodsDialogComponent } from "./verification-methods-dialog/verification-methods-dialog.component";
import { AnnualFeeDisclaimerComponent } from "./annual-fee-disclaimer/annual-fee-disclaimer.component";
import { ConfirmDeactivateModalComponent } from "./confirm-deactivate-modal/confirm-deactivate-modal.component";
import { CommissionAtsignComponent } from './user/commission-atsign/commission-atsign.component';
import { PromoCodeComponent } from './user/promo-code/promo-code.component';
import { CommissionAtsignModelComponent } from './user/commission-atsign-model/commission-atsign-model.component';
import { CommissionReportComponent } from './commission-report/commission-report.component';
import { CommissionReportsDetailsComponent } from './commission-reports-details/commission-reports-details.component';
import { CommissionReportsDetailsModelComponent } from './user/commission-reports-details-model/commission-reports-details-model.component';
import { CommissionAtsignApproveComponent } from './user/commission-atsign-approve/commission-atsign-approve.component';
// import { SendGiftCardComponent } from './send-gift-card/send-gift-card.component';
import { GiftUpCardComponent } from './gift-up-card/gift-up-card.component';
import { UserCommissionDashboardComponent } from './user-commission-dashboard/user-commission-dashboard.component';
import { EnableWaitListComponent } from "./enable-wait-list/enable-wait-list.component";
import { TransferAtsignComponent } from './transfer-atsign/transfer-atsign.component';
import { AtsignTransferListComponent } from './atsign-transfer-list/atsign-transfer-list.component';
import { AllTransferAtsignComponent } from './all-transfer-atsign/all-transfer-atsign.component';
import { KeypressHandlerDirective } from './directives/keypress-handler.directive';
import { RenewalPaymentComponent } from './app/renewal-payment/renewal-payment.component';
import { HelpComponent } from './user/commission-atsign/help/help.component';
import { PartnerDashboardComponent } from './app/partner-dashboard/partner-dashboard.component';
import { ManageAtsignComponent } from './manage-atsign/manage-atsign.component';
import { TransferAtsignPaymentComponent } from './transfer-atsign-payment/transfer-atsign-payment.component';
import { AssignAtsignsComponent } from './assign-atsigns/assign-atsigns.component';
import { ConfirmDeleteContactDialogComponent } from './verification-methods-dialog/dialog/confirm-delete-contact-dialog/confirm-delete-contact-dialog.component';
import { OTPInputDirective } from './directives/otp-input.directive';
import { ResetAtsignComponent } from './app/manage-atsign/reset-atsign/reset-atsign.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { AdminTransferAtsignComponent } from './app/admin-transfer-atsign/admin-transfer-atsign.component';

@NgModule({
  declarations: [
    AppComponent,
    NumberDirective,
    UserComponent,
    SignUpComponent,
    UserProfileComponent,
    SignInComponent,
    HomeComponent,
    ShowUsersComponent,
    RegisterComponent,
    DashboardComponent,
    CheckoutComponent,
    NavbarComponent,
    StandardSignComponent,
    AccountVerifyComponent,
    AccountConfirmationComponent,
    InviteLinkComponent,
    SimilarSignInComponent,
    PremiumSigninComponent,
    TermsConditionComponent,
    ModalDialogComponent,
    PolicyComponent,
    AboutComponent,
    FaqComponent,
    TermsComponent,
    ConfirmationModalComponent,
    ReservedAtsignsComponent,
    HomeCommonComponent,
    ProductInfoComponent,
    HealthCheckupComponent,
    DevelopersComponent,
    PickasignComponent,
    WelcomeComponent,
    ReportsComponent,
    CareerComponent,
    VerificationCodeComponent,
    UserLogComponent,
    PreventDoubleClickDirective,
    PhoneMaskDirective,
    ChangePasswordComponent,
    CareersComponent,
    BottomSheetComponent,
    ActivateAtsignComponent,
    ShoppingCartEmptyDialogComponent,
    InterstitialLoaderComponent,
    InviteHistoryDialogComponent,
    ShoppingCartDialogComponent,
    InviteShareableLinkDialogComponent,
    PurchasedSignsModalComponent,
    PurchaseHistoryDialogComponent,
    VerificationMethodsDialogComponent,
    AnnualFeeDisclaimerComponent,
    ConfirmDeactivateModalComponent,
    CommissionAtsignComponent,
    PromoCodeComponent,
    CommissionAtsignModelComponent,
    CommissionReportComponent,
    CommissionReportsDetailsComponent,
    CommissionReportsDetailsModelComponent,
    CommissionAtsignApproveComponent,
    // SendGiftCardComponent,
    GiftUpCardComponent,
    UserCommissionDashboardComponent,
    EnableWaitListComponent,
    TransferAtsignComponent,
    AtsignTransferListComponent,
    AllTransferAtsignComponent,
    KeypressHandlerDirective,
    RenewalPaymentComponent,
    HelpComponent,
    PartnerDashboardComponent,
    ManageAtsignComponent,
    TransferAtsignPaymentComponent,
    AssignAtsignsComponent,
    ConfirmDeleteContactDialogComponent,
    OTPInputDirective,
    ResetAtsignComponent,
    ConfirmDialogComponent,
    AdminTransferAtsignComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes, { scrollPositionRestoration: "enabled" }),
    HttpClientModule,
    FontAwesomeModule,
    ButtonsModule.forRoot(),
    BrowserAnimationsModule,
    DemoMaterialModule,
    CountdownModule,
    PickerModule,
    NgxSpinnerModule,
    DeviceDetectorModule.forRoot(),
    Ng2TelInputModule,
    ChartsModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([UserEffect]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    ThemeService,
    AuthGuard,
    UserService,
    CookieService,
    ReportService,
    InterstitialLoaderService,
    CountdownGlobalConfig,
    Store,
  ],
  bootstrap: [AppComponent],
  exports: [PhoneMaskDirective],
  entryComponents: [
    UserProfileComponent,
    InviteLinkComponent,
    SimilarSignInComponent,
    TermsConditionComponent,
    ConfirmationModalComponent,
    BottomSheetComponent,
    ChangePasswordComponent,
    ActivateAtsignComponent,
    ShoppingCartDialogComponent,
    ShoppingCartEmptyDialogComponent,
    ProductInfoComponent,
    InviteHistoryDialogComponent,
    InviteShareableLinkDialogComponent,
    PurchasedSignsModalComponent,
    PurchaseHistoryDialogComponent,
    VerificationMethodsDialogComponent,
    ConfirmDeactivateModalComponent,
    PromoCodeComponent,
    CommissionAtsignModelComponent,
    CommissionReportsDetailsModelComponent,
    CommissionAtsignApproveComponent,
    // SendGiftCardComponent,
    TransferAtsignComponent,
    ManageAtsignComponent,
    HelpComponent,
    ConfirmDeleteContactDialogComponent,
    ConfirmDialogComponent,
    AdminTransferAtsignComponent
  ],
})
export class AppModule {}
