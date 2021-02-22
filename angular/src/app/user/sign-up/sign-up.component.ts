import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  showSucessMessage: boolean;
  serverErrorMessages: string;
  model: any = {
    secretkey:'',
    email:'',
    role:'1',
    password:''
  }
  constructor(public userService: UserService) { }

  ngOnInit() {
   
  }

  onSubmit(form: NgForm) {
    this.serverErrorMessages = '';
    this.showSucessMessage = false;
    this.userService.postUser(form.value).subscribe(
        res => {
            if (res['status'] === 'success') {
                this.showSucessMessage = true;
                setTimeout(() => this.showSucessMessage = false, 4000);
                this.resetForm(form);
            } else {
                
                this.serverErrorMessages = 'Thank you, we already have you on our list!';
            }
        },
      err => {
     
        if (err.status === 422) {
          this.serverErrorMessages = err.error.join('<br/>');
        }
        if (err.status === 401) {
          this.serverErrorMessages = 'You are not allowed to perform this action.';
        } else {
          this.serverErrorMessages = 'Something went wrong. Please contact admin.';
        }
      }
    );
  }

  resetForm(form: NgForm) {
    form.resetForm();
    
  }

}
