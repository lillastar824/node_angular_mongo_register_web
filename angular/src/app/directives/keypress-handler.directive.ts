import { Output } from '@angular/core';
import { Directive, EventEmitter, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';
import emojiRegexFunction from 'emoji-regex/text';

@Directive({
  selector: '[appKeypressHandler]'
})
export class KeypressHandlerDirective {

  @Output() 
  onKeyPressHandle = new EventEmitter<string>();

  constructor(private ngControl: NgControl) { }

  @HostListener('keypress', ['$event'])
  onKeyPress($event) {
    let specialCharError = null;
    let  k = $event.charCode;
    let isValidKey = this.isValidCharCode(k);
    if (!isValidKey) {
      specialCharError = `No ${$event.key === ' ' ? 'Space' : $event.key} please!`;
    }
    this.onKeyPressHandle.emit(specialCharError);
    return isValidKey;        
  }
  @HostListener('keyup', ['$event'])
  onKeyup($event) {
    $event.target.value = $event.target.value.toLowerCase();
    if(this.ngControl.control) {
      this.ngControl.control.setValue($event.target.value)
    }
  }

  @HostListener('input', ['$event']) 
  ngOnChanges() {
    let value = this.ngControl.value;
    
    if( typeof value === "string" ) {
      let inputChars : string[]= value.split(/.*?/u);
      let len = inputChars.length;
      let specialCharError = null;
      let specialChars = new Set()

      for(let i =0; i < len; i++) {
        let isEmoji = inputChars[i].match(emojiRegexFunction())
        if(!isEmoji) {
          if(!this.isValidCharCode(inputChars[i].codePointAt(0))) {
            specialChars.add(inputChars[i])
          }
        }
      }
      
      if(specialChars.size > 0) {
        specialChars.forEach((char) => {
          value = value.replaceAll(char, '')
        })
        this.ngControl.control.setValue(value)
        specialCharError = `No ${Array.from(specialChars).map((char) => char === " " ? 'Space' : char).join(',')} please!`;
      }

      this.ngControl.control.setValue(value.toLowerCase())
      this.onKeyPressHandle.emit(specialCharError);
    }
    
  }

  isValidCharCode(k) {
    return ((k > 64 && k < 91) || (k > 94 && k < 123) || k == 8 || (k >= 48 && k <= 57) || k === 13)
  }

}
