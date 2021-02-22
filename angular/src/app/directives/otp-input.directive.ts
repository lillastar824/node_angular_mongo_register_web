import {
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  OnInit,
  Output,
  Renderer2,
  Self,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appOTPInput]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OTPInputDirective),
      multi: true,
    },
  ],
})
export class OTPInputDirective implements ControlValueAccessor {
  /** implements ControlValueAccessorInterface */
  _onChange: (_: any) => void;

  /** implements ControlValueAccessorInterface */
  _touched: () => void;

  @Output() 
  onOTPInputHandle = new EventEmitter<any>();
  
  constructor(@Self() private _el: ElementRef, private _renderer: Renderer2) { }

  @HostListener('keyup', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    let value =  event.key.toUpperCase();
    let name = this._el.nativeElement.getAttribute("name");      
    //86-> v, 17-> cntrl, 13-> enter
    // if (event.keyCode === 86 || event.keyCode === 17 || event.keyCode === 13) {
    //     return false;
    // }        
    // var inp = String.fromCharCode(event.keyCode);  
   
    // alert(event.target['value'])
// alert(value)
// alert(event.target['value'])
    if (/[a-zA-Z0-9]/.test(value) && value.length ===1 && event.keyCode !== 86) {
      event.target['value']= value;
      // this._renderer.setProperty(this._el.nativeElement, 'value', value);
    }
    // else if (event.keyCode === 229) {
    //   value = event.target['value'];
      
    //     if (value.length > 0) {
    //       value = value.charAt(value.length -1)
    //       this._renderer.setProperty(this._el.nativeElement, 'value', value);
    //     }

    // }
    else if(/[a-zA-Z0-9]/.test(value) && event.target['value'].length>1)
    {
      event.target['value']=  event.target['value'].substr(event.target['value'].length - 1).toUpperCase();
    }else
    {
      return false;
    }
    let data = { name : name, keyCode : event.keyCode, value : event.target['value'], target : this._el.nativeElement}

    this.onOTPInputHandle.emit(data);
    this._onChange(event.target['value']);
    return true;
  }
  

  @HostListener('blur', ['$event'])
  onBlur() {
    this._touched();
  }

  /** Implementation for ControlValueAccessor interface */
  writeValue(value: any): void {
    this._renderer.setProperty(this._el.nativeElement, 'value', value ? value : '');
  }

  /** Implementation for ControlValueAccessor interface */
  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }

  /** Implementation for ControlValueAccessor interface */
  registerOnTouched(fn: () => void): void {
    this._touched = fn;
  }

  /** Implementation for ControlValueAccessor interface */
  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._el.nativeElement, 'disabled', isDisabled);
  }
}
