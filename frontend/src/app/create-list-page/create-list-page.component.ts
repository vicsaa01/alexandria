import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PopUpMessageComponent } from '../pop-up-message/pop-up-message.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';

@Component({
  selector: 'app-create-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopUpMessageComponent],
  templateUrl: './create-list-page.component.html',
  styleUrl: './create-list-page.component.css'
})
export class CreateListPageComponent {
  createListForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    isPrivate: new FormControl(false)
  });
  showMessage: boolean = false;
  message: string = "";
  messageType: string = "";

  constructor(private client: Client, private jwt: JSONWebToken, private router: Router) {}

  return(): void {
    this.router.navigate(['/my-lists']); // go to previous url
  }

  async submitForm(): Promise<void> {
    var name = this.createListForm.value.name ?? '';
    var isPrivate = this.createListForm.value.isPrivate ?? false;

    console.log('\"Create list\" form submitted ->\n\tName: ' + name + '\n\tIs private: ' + isPrivate);

    if (name === '') {
      this.message = "Please enter a name for your list";
      this.messageType = "error";
      this.showMessage = true;
      setTimeout(() => {this.showMessage = false;}, 5000);
    } else {
      this.showMessage = false;

      // Generate token
      const token = await this.jwt.createValidatedToken(60);

      // Send data to API
      if (token !== "Invalid session") {
        fetch(this.client.apiUrl + '/create-list', {
          method: 'POST',
          headers: {
            'Content-Type':'application/json',
            'Authorization':'Bearer '+token
          },
          body: JSON.stringify({
            name: name,
            isPrivate: isPrivate
          })
        })
        .then(res => res.json())
        .then(data => {
          console.log('Response ->\n\t', data);
          if (!data.error) {
            this.message = data.message;
            this.messageType = "success";

            this.createListForm = new FormGroup({
              name: new FormControl('', Validators.required),
              isPrivate: new FormControl(false)
            });
          } else {
            this.message = data.error;
            this.messageType = "error";
          }
          this.showMessage = true;
          setTimeout(() => {this.showMessage = false;}, 5000);
        })
        .catch(error => {
          console.error('Error:', error.message);
          this.message = "Server did not respond. Please try again later.";
          this.messageType = "error";
          this.showMessage = true;
          setTimeout(() => {this.showMessage = false;}, 7000);
        })
      } else {
        alert("Your session is invalid. Please log in correctly.");
      }
    }
  }
}
