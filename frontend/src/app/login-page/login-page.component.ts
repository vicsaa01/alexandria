import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Client } from '../../client';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  })
  formError: boolean = false;

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
      this.formError = true;
      alert('Please enter an email address and a password');
      return;
    } else {
      this.formError = false;

      // Send data to API
      fetch(this.client.apiUrl + '/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log('Response ->\n\t', data);
        alert(data.message);

        this.loginForm = new FormGroup({
          email: new FormControl('', Validators.required),
          password: new FormControl('', Validators.required)
        })

        localStorage.setItem('sessionToken',data.sessionToken);
        localStorage.setItem('userID',data.userID.$oid);
        window.location.assign('/');
      })
      .catch(error => {
        console.error('Error:', error.message);
        alert("Server response error. Please try again later.");
      })
    }
  }
}
