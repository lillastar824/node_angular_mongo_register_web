import { Routes } from '@angular/router';
import { UserComponent } from './user/user.component';
import { SignUpComponent } from './user/sign-up/sign-up.component';
import { SignInComponent } from './user/sign-in/sign-in.component';
import { RegisterComponent } from './user/register/register.component';
import { StandardSignComponent } from './user/standard-sign/standard-sign.component';
import { PremiumSigninComponent } from './user/premium-signin/premium-signin.component';
import { AccountVerifyComponent } from './user/account-verify/account-verify.component';
import { ShowUsersComponent } from './show-users/show-users.component';
import { HomeComponent } from './home/home.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountConfirmationComponent } from './user/account-confirmation/account-confirmation.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AuthGuard } from './auth/auth.guard';
import { TermsComponent } from './terms/terms.component';
import { PolicyComponent } from './policy/policy.component';
import { AboutComponent } from './about/about.component';
import { FaqComponent } from './faq/faq.component';
import { DevelopersComponent } from './developers/developers.component';
import { PickasignComponent } from './pickasign/pickasign.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ReservedAtsignsComponent } from './reserved-atsigns/reserved-atsigns.component';
import { HealthCheckupComponent } from './health-checkup/health-checkup.component';
import { ReportsComponent } from './reports/reports.component';
// import { CareerComponent } from './career/career.component';
import { UserLogComponent } from './user-log/user-log.component';
import { CareersComponent } from './careers/careers.component';
import { Role } from './shared/model/role';
import { CommissionAtsignComponent } from './user/commission-atsign/commission-atsign.component';
import { CommissionReportComponent } from './commission-report/commission-report.component';
import { CommissionReportsDetailsComponent } from './commission-reports-details/commission-reports-details.component';
import { GiftUpCardComponent } from './gift-up-card/gift-up-card.component';
import { UserCommissionDashboardComponent } from './user-commission-dashboard/user-commission-dashboard.component';
import { EnableWaitListComponent } from './enable-wait-list/enable-wait-list.component';
import { AtsignTransferListComponent } from './atsign-transfer-list/atsign-transfer-list.component';
import { AllTransferAtsignComponent } from './all-transfer-atsign/all-transfer-atsign.component';
import { RenewalPaymentComponent } from './app/renewal-payment/renewal-payment.component';
import { PartnerDashboardComponent } from './app/partner-dashboard/partner-dashboard.component';
import { TransferAtsignPaymentComponent } from './transfer-atsign-payment/transfer-atsign-payment.component';
import { AssignAtsignsComponent } from './assign-atsigns/assign-atsigns.component';
const defaultTitle = 'The @ Company - ';

export function getTitle(title) {
  return { 'title': defaultTitle + title };
}
export const appRoutes: Routes = [
  {
    path: 'appathon',
    loadChildren: () => new Promise( () => { if(window.location.href.match(/appathon/) ) window.location.href = 'https://appathon.atsign.com'; } ) 
  },
  {
    path: 'home',  component: DashboardComponent, canActivate: [AuthGuard],
    data: { 'title': getTitle('Dashboard'), roles: [Role.User] }
  },
  {
    path: 'home/:invitecode',  component: DashboardComponent, canActivate: [AuthGuard],
    data: { 'title': getTitle('Dashboard'), roles: [Role.User] }
  },
  {		
    path: 'devhome', component: HomeComponent, data: {'title': getTitle('Register your @sign today')}		
  },		
  {		
    path: 'devhome/:invitecode', component: HomeComponent, data: {'title': getTitle('Register your @sign today')}		
  },
  {
    path: 'devhome', component: HomeComponent, data: {'title': getTitle('Register your @sign today')}
  },
  {
    path: 'devhome/:invitecode', component: HomeComponent, data: {'title': getTitle('Register your @sign today')}
  },
  {
    path: 'policy', component: PolicyComponent, data: {'title': getTitle('Policy')}
  },
  {
    path: 'terms', component: TermsComponent, data: {'title': getTitle('Terms')}
  },
  {
    path: 'about', component: AboutComponent, data: {'title': getTitle('About Us')}
  },
  {
    path: 'faq', component: FaqComponent, data: {'title': getTitle('FAQ')}
  },
  // {
  //     path: 'career', component: CareerComponent, data: {'title': getTitle('Career')}
  // },
  {
    path: 'developers', component: DevelopersComponent, data: {'title': getTitle('Developers')}
  },
  {
    path: 'pickatsign', component: PickasignComponent, data: {'title': getTitle('Pick @sign')}
  },
  {
    path: 'signup', component: UserComponent,
    children: [{ path: '', component: SignUpComponent }], data: {'title': getTitle('Signup')}
  },
  {
    path: 'login/:type', component: UserComponent,
    children: [{ path: '', component: SignInComponent }], data: {'title': getTitle('Admin Login')}
  },
  {
    path: 'login', component: UserComponent,
    children: [{ path: '', component: SignInComponent }], data: {'title': getTitle('Login')}
  },
  {
    path: 'register/:id/:code/:upgrade', component: UserComponent,
    children: [{ path: '', component: RegisterComponent }], 
    data: {'title': getTitle('Register')}
  },
  {
    path: 'welcome/:id/:code/:upgrade', component: UserComponent,
    children: [{ path: '', component: WelcomeComponent }], 
    data: {'title': getTitle('Free Welcome')}
  },
  {
    path: 'register/:inviteCode', component: UserComponent,
    children: [{ path: '', component: RegisterComponent }], 
    data: {'title': getTitle('Register')}
  },
  {
    path: 'welcome/:inviteCode', component: UserComponent, 
    children: [{ path: '', component: WelcomeComponent }], 
    data: {'title': getTitle('Free Welcome')}
  },
  {
    path: 'welcomep/:inviteCode', component: UserComponent,
    children: [{ path: '', component: WelcomeComponent }], 
    data: {'title': getTitle('Premium Welcome')}
  },
  {
    path: 'standard-sign/:id/:code/:upgrade', component: UserComponent,
    children: [{ path: '', component: StandardSignComponent }], 
    data: {'title': getTitle('Free @sign')}
  },
  {
    path: 'standard-sign/:inviteCode', component: UserComponent,
    children: [{ path: '', component: StandardSignComponent }], 
    data: {'title': getTitle('Free @sign Link')}
  },
  {
    path: 'premium-sign/:id/:code/:upgrade', component: UserComponent,
    children: [{ path: '', component: PremiumSigninComponent }], 
    data: {'title': getTitle('Premium @sign')}
  },
  {
    path: 'premium-sign/:inviteCode', component: UserComponent,
    children: [{ path: '', component: PremiumSigninComponent }], 
    data: {'title': getTitle('Premium @sign Link') }
  },
  {
    path: 'user-commission-dashboard', component: UserComponent,
    children: [{ path: '', component: UserCommissionDashboardComponent }], 
    data: {'title': getTitle('commission user Dashboard ') }
  },
  {
    path: 'account-verify/:id/:code/:upgrade', component: UserComponent,
    children: [{ path: '', component: AccountVerifyComponent }], 
    data: {'title' : getTitle('Account Verification')}
  },
  {
    path: 'account-verify/:inviteCode', component: UserComponent,
    children: [{ path: '', component: AccountVerifyComponent }],
    data: {'title' : getTitle('Account Verification Link')}
  },
  {
    path: 'userprofile', component: UserProfileComponent, canActivate: [AuthGuard]
  },
  {
    path: 'getallusers', component: ShowUsersComponent, canActivate: [AuthGuard],
    data: { title: getTitle('Admin All Users'), roles: [Role.Admin] }
  },
  {
    path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard],
    data: {'title' : getTitle('Checkout'), roles: [Role.User]}
  },
  {
    path: 'all-transfer-atsign', component: AllTransferAtsignComponent, canActivate: [AuthGuard],
    data: {'title' : getTitle('all-transfer-atsign'), roles: [Role.Admin]}
  },
  {
    path: 'atsign-transfer-list', component: AtsignTransferListComponent, canActivate: [AuthGuard],
    data: {'title' : getTitle('Atsign-transfer-list'), roles: [Role.User]}
  },
  {
    path: 'checkout/:code', component: CheckoutComponent,
    data: {'title' : getTitle('Checkout')}
  },
  {
    path: 'accountconfirmation', component: AccountConfirmationComponent, canActivate: [AuthGuard], 
    data: {'title': getTitle('Confirmation'), roles: [Role.User]}
  },
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],
    data: { 'title': getTitle('Dashboard'), roles: [Role.User] }
  },
  {
    path: 'reservedatsigns', component: ReservedAtsignsComponent, canActivate: [AuthGuard], 
    data: {'title' : getTitle('Reserve'), roles: [Role.Admin]}
  },
  {
    path: 'enable-wait-list', component: EnableWaitListComponent, canActivate: [AuthGuard], 
    data: {'title' : getTitle('enable-wait-list'), roles: [Role.Admin]}
  },
  {
    path: 'commission-report', component: CommissionReportComponent, canActivate: [AuthGuard], 
    data: {'title' : getTitle('Commission'), roles: [Role.Admin]}
  },
  {
    path: 'commission-reports-details/:id', component: CommissionReportsDetailsComponent, canActivate: [AuthGuard], 
    data: {'title' : getTitle('Commission'), roles: [Role.Admin]}
  },
  {
    path: 'reports', component: ReportsComponent, canActivate: [AuthGuard],
    data: { title: getTitle('Reports'), roles: [Role.Admin, Role.AdminReport] }
  },
  {
    path: 'userlog', component: UserLogComponent, canActivate: [AuthGuard], 
    data: { 'title': getTitle('User Log'), roles: [Role.Admin]}
  },
  {
    path: 'healthcheckup', component: HealthCheckupComponent
  },
  {
    path: 'gift-up-card', component: GiftUpCardComponent
  },
  {
    path: 'career', component: CareersComponent, data: {'title': getTitle('Career')}
  },
  {
    path: 'commission-atsign', component: CommissionAtsignComponent
  },
  {
    path: 'renewal-payment', component: RenewalPaymentComponent, canActivate: [AuthGuard],
    data : { 'title' : getTitle('Payment Renewal') , roles: [Role.User] }
  },
  {
    path: 'partner-dashboard', component: PartnerDashboardComponent, canActivate: [AuthGuard],
    data : { 'title' : getTitle('Dashboard') , roles: [Role.User] }
  },
  {
    path: 'transfer-atsign-payment', component: TransferAtsignPaymentComponent, canActivate: [AuthGuard],
    data : { 'title' : getTitle('Transfrer Atsign Payment') , roles: [Role.User] }
  },
  {
    path: 'assign-atsigns', component: AssignAtsignsComponent, canActivate: [AuthGuard],
    data : { 'title' : getTitle('Assign Free @signs') , roles: [Role.Admin] }
  },
  {
    path: '', pathMatch: 'full', redirectTo: 'dashboard'
  },
  {
    path: '**', redirectTo: 'login', pathMatch: 'full'
  }
];