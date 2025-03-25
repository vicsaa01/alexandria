import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { apiURL } from '../app.component';

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
    password: new FormControl('', Validators.required) // Min length
  })
  formError: boolean = false;

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
      fetch(apiURL + '/login', {
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

        // Store session token
      })
      .catch(error => {
        console.error('Error:', error.message);
        alert("Server response error. Please try again later.");
      })
    }
  }
}
