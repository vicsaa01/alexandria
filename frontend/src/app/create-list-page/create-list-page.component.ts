import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { apiURL } from '../app.component';

@Component({
  selector: 'app-create-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  submitForm(): void {
    var user_id = '0'; // Default user ID
    var name = this.createListForm.value.name ?? '';
    var isPrivate = this.createListForm.value.isPrivate ?? false;

    console.log('\"Create list\" form submitted ->\n\tUser ID: ' + user_id + '\n\tName: ' + name + '\n\tIs private: ' + isPrivate);

    if (name === '') {
      this.formError = true;
      alert('Please enter a name for your list');
    } else {
      this.formError = false;

      // Send data to API
      fetch(apiURL + '/create-list', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          user_id: user_id,
          name: name,
          isPrivate: isPrivate
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log('Response ->\n\t', data);
        alert(data.message);

        this.createListForm = new FormGroup({
          user_id: new FormControl('', Validators.required),
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
