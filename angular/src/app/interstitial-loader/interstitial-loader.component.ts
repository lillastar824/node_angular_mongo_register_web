import { Component, Input, OnInit } from "@angular/core";
import { InterstitialLoaderService } from "../shared/services/interstitial-loader.service";

@Component({
  selector: "app-interstitial-loader",
  templateUrl: "./interstitial-loader.component.html",
  styleUrls: ["./interstitial-loader.component.css"],
})
export class InterstitialLoaderComponent implements OnInit {
  @Input()
  icon: string;
  @Input()
  message: string;
  showLoader: boolean = false;

  constructor(private interstitialLoaderService: InterstitialLoaderService) {}

  ngOnInit() {
    this.interstitialLoaderService.    
    invokeSetLoader.subscribe((params) => {   
        this.icon = params.svg;
        this.message = params.message;
        this.showLoader = true;
        setTimeout(() => {
          this.showLoader = false;
        }, 3000);
      });
  }
  
}
