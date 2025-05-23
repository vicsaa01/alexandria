import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { PopUpMessageComponent } from '../pop-up-message/pop-up-message.component';
import { Client } from '../../client';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopUpMessageComponent],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  registerForm: FormGroup = new FormGroup({
    email: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    rpassword: new FormControl('', Validators.required)
  })
  showMessage: boolean = false;
  message: string = "";
  messageType: string = "";

  constructor(private router: Router, private client: Client) {}

  return(): void {
    this.router.navigate(['/']);
  }

  submitForm(): void {
    var email: string = this.registerForm.value.email ?? '';
    var username: string = this.registerForm.value.username ?? '';
    var password: string = this.registerForm.value.password ?? '';
    var rpassword: string = this.registerForm.value.rpassword ?? '';
    var secret: string = '';
    for (let i=0; i<password.length; i++) {
      secret += '*';
    }
    console.log('\"Register\" form submitted ->\n\tEmail: ' + email + '\n\tUsername: ' + username + '\n\tPassword: ' + secret);

    if (email === '' || username === '' || password === '' || rpassword === '') {
      this.message = "Please fill in all fields";
      this.messageType = "error";
      this.showMessage = true;
      setTimeout(() => {this.showMessage = false;}, 5000);
      return;
    } else if (password.length < 8) {
      this.message = "Password must be at least 8 characters long";
      this.messageType = "error";
      this.showMessage = true;
      setTimeout(() => {this.showMessage = false;}, 5000);
      return;
    } else if (password !== rpassword) {
      this.message = "Passwords don't match";
      this.messageType = "error";
      this.showMessage = true;
      setTimeout(() => {this.showMessage = false;}, 5000);
      return;
    } else {
      this.showMessage = false;

      // Send data to API
      fetch(this.client.httpsUrl + '/register', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          email: email,
          username: username,
          password: password
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log('Response ->\n\t', data);
        if (data.message === "User created") {
          this.registerForm = new FormGroup({
            email: new FormControl('', Validators.required),
            username: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required),
            rpassword: new FormControl('', Validators.required)
          })
          this.router.navigate(['/login']);
          return;
        }

        this.message = data.message;
        this.messageType = "error";
        this.showMessage = true;
        setTimeout(() => {this.showMessage = false;}, 7000);
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
