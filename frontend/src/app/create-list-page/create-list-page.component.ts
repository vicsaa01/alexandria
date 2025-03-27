import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Client } from '../../client';

@Component({
  selector: 'app-create-list-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-list-page.component.html',
  styleUrl: './create-list-page.component.css'
})
export class CreateListPageComponent {
  createListForm: FormGroup = new FormGroup({
    user_id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    isPrivate: new FormControl(false)
  });
  formError: boolean = false;

  constructor(private client: Client, private router: Router) {}

  return(): void {
    this.router.navigate(['/my-lists']); // go to previous url
  }

  submitForm(): void {
    var userID = localStorage.getItem('userID');
    var name = this.createListForm.value.name ?? '';
    var isPrivate = this.createListForm.value.isPrivate ?? false;

    console.log('\"Create list\" form submitted ->\n\tUser ID: ' + userID + '\n\tName: ' + name + '\n\tIs private: ' + isPrivate);

    if (name === '') {
      this.formError = true;
      alert('Please enter a name for your list');
    } else {
      this.formError = false;

      // Send data to API
      fetch(this.client.apiUrl + '/create-list', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          userID: userID,
          name: name,
          isPrivate: isPrivate
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log('Response ->\n\t', data);
        alert(data.message);

        this.createListForm = new FormGroup({
          userID: new FormControl('', Validators.required),
          name: new FormControl('', Validators.required),
          isPrivate: new FormControl(false)
        });
      })
      .catch(error => {
        console.error('Error:', error.message);
        alert("Server did not respond. Please try again later.");
      })
    }
  }
}
