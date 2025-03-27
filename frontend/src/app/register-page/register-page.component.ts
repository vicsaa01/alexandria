import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { Client } from '../../client';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  registerForm: FormGroup = new FormGroup({
    email: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required), // min length
    rpassword: new FormControl('', Validators.required) // min length
  })
  formError: boolean = false;

  constructor(private router: Router, private client: Client) {}

  return(): void {
    this.router.navigate(['/']); // go to previous url
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
      this.formError = true;
      alert('Please fill in all fields');
      return;
    } else if (password !== rpassword) {
      this.formError = true;
      alert('Passwords don\'t match');
      return;
    } else {
      this.formError = false;

      // Send data to API
      fetch(this.client.apiUrl + '/register', {
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
        alert(data.message);
      
        this.registerForm = new FormGroup({
          email: new FormControl('', Validators.required),
          username: new FormControl('', Validators.required),
          password: new FormControl('', Validators.required),
          rpassword: new FormControl('', Validators.required)
        })

        this.router.navigate(['/login']);
      })
      .catch(error => {
        console.error('Error:', error.message);
        alert("Server response error. Please try again later.");
      })
    }
  }
}
