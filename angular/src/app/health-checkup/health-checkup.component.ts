import { Component, OnInit } from '@angular/core';
import {UserService} from "../shared/services/user.service"

@Component({
  selector: 'app-health-checkup',
  templateUrl: './health-checkup.component.html',
  styleUrls: ['./health-checkup.component.css']
})
export class HealthCheckupComponent implements OnInit {
  
  mongoStatus : string= "";
  mongoStatusMessage : string = "";
  errorDescription: string ="";
  constructor(private userService : UserService) {}

  ngOnInit() {

  this.userService.checkHealthStatus().subscribe(res => {
    this.mongoStatus= "Connected";
  }, err => {
    this.mongoStatus= "Disconnected";
  });

  }

}
