import { Component, OnInit, Input, Inject } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationsService } from '../shared/notifications.service';

@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.css']
})
export class ProductInfoComponent implements OnInit {
  @Input() productNotificationEmail: boolean;
  @Input() productNotificationMobile: boolean;
  @Input() contact: string;
  userDetails: any = {email:"",productNotificationEmail: null, productNotificationMobile: null};
  notifications: any[] = []; 
  readNotifications: any[] = [];
  unreadNotifications: any[] = [];
 
  constructor(private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProductInfoComponent>,
    private notificationService: NotificationsService) { }

  ngOnInit() {
    this.fetchAndUpdateNotifications();
  }

  markNotificationsAsRead() {
    if(this.unreadNotifications.length > 0 ) {
      this.notificationService.markNotificationsAsRead( this.unreadNotifications).subscribe((notifications : any[]) => {
      });
    }
  }

  fetchAndUpdateNotifications() {
    this.notificationService.getNotifications().subscribe((notifications : any[]) => {
      this.notifications = notifications;
      this.readNotifications = [...notifications].filter((notification) => notification.readAt !== null)
      this.unreadNotifications = [...notifications].filter((notification) => notification.readAt === null)
      this.markNotificationsAsRead();
    }) 
  }

  onNoClick(): void {
    this.dialogRef.close({ event: "Updated", data: this.data});
  }

  openMyAtsignsWindowForRenewal($event) {
    $event.preventDefault();
    this.dialogRef.close({ event: "RENEWAL"});
  }

  formatAtsigns(atsigns){
    return atsigns.reduce((acc,val,key)=>(key === atsigns.length - 1) ? ((acc + `${key==0 ? '':' and '}@`) + val) :(acc + `${key==0 ? '':', '}@` + val),"")
  }

//   saveProductNotification(name, value) {
//     let data = {};
//     data['email'] = this.userDetails['email'];
//     data[name] = value.checked;
//     data['name'] = name;
//     this.data[name] = value.checked;
//     this.userService.saveProductNotification(data).subscribe(
//         res => {
//         },
//         err => {
//             //console.log(err);
//         }
//     );
// }

}
