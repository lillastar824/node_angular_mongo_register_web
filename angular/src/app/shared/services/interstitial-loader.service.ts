import { Injectable, ViewChild, ElementRef, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InterstitialLoaderService {

  invokeSetLoader = new EventEmitter();    

  constructor() { }

  hide() {
    document.getElementById('interstitial-loader').style.display = 'none';
  }
  onFirstComponentButtonClick() {    
    this.invokeSetLoader.emit();    
  }    
  show(params) {
    this.invokeSetLoader.emit(params);
  }
}
