import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PopUpMessageComponent } from '../pop-up-message/pop-up-message.component';
import { Client } from '../../client';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopUpMessageComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  })
  showMessage: boolean = false;
  message: string = "";
  messageType: string = "";

  constructor(private client: Client, private router: Router) {}

  return(): void {
    this.router.navigate(['/']); // go to previous url
  }

  submitForm(): void {
    var email: string = this.loginForm.value.email ?? '';
    var password: string = this.loginForm.value.password ?? '';
    var secret: string = '';
    for (let i=0; i<password.length; i++) {
      secret += '*';
    }
    console.log('\"Login\" form submitted ->\n\tEmail: ' + email + '\n\tPassword: ' + secret);

    if (email === '' || password === '') {
      this.message = "Please enter an email address and a password";
      this.messageType = "error";
      this.showMessage = true;
      setTimeout(() => {this.showMessage = false;}, 5000);
      return;
    } else {
      this.showMessage = false;

      // Send data to API
      fetch(this.client.apiUrl + '/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          email: email,
          password: password
        }) // encrypt this (HTTP)
      })
      .then(res => res.json())
      .then(data => {
        console.log('Response ->\n\t', data);
        if (data.userID) {
          this.loginForm = new FormGroup({
            email: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required)
          });
          localStorage.setItem('sessionToken',data.sessionToken);
          localStorage.setItem('userID',data.userID);
          window.location.assign('/');
          return;
        }

        this.message = data.message;
        this.messageType = "error";
        this.showMessage = true;
        setTimeout(() => {this.showMessage = false;}, 5000);
      })
      .catch(error => {
        console.error('Error:', error.message);
        this.message = "Server response error. Please try again later.";
        this.messageType = "error";
        this.showMessage = true;
        setTimeout(() => {this.showMessage = false;}, 7000);
      })
    }
  }
}
