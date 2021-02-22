import { Component, OnInit } from "@angular/core";
import { UserService } from "../shared/services/user.service";
// import { clearInterval } from "timers";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  constructor(private userService: UserService) { }

ngOnInit() {

}
}
