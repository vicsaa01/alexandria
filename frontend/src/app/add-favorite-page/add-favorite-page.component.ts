import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PopUpMessageComponent } from '../pop-up-message/pop-up-message.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';

@Component({
  selector: 'app-add-favorite-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopUpMessageComponent],
  templateUrl: './add-favorite-page.component.html',
  styleUrl: './add-favorite-page.component.css'
})
export class AddFavoritePageComponent {
  addFavoriteForm: FormGroup = new FormGroup({
    tag: new FormControl(''),
    url: new FormControl('', Validators.required)
  });
  showMessage: boolean = false;
  message: string = "";
  messageType: string = "";

  constructor(private client: Client, private jwt: JSONWebToken, private router: Router) {}

  return(): void {
    this.router.navigate(['/favorites']); // go to previous url
  }

  submitForm(): void {
    var tag = this.addFavoriteForm.value.tag ?? '';
    var url = this.addFavoriteForm.value.url ?? '';
    console.log('\"Add Favorite\" form submitted ->\n\tTag: ' + tag + '\n\tURL: ' + url);

    if (url === '') {
      this.message = "Please enter the site URL";
      this.messageType = "error";
      this.showMessage = true;
      setTimeout(() => {this.showMessage = false;}, 5000);
      return;
    } else {
      this.showMessage = false;

      // Fetch site title (and icon)
      fetch(this.client.apiUrl + '/get-site-info?url=' + url)
      .then(res => res.json())
      .then(data => {
        console.log("Site fetch response ->\n\t", data);
        if (data.title) {
          if (tag == '') tag = data.title;

          // Send data to API
          const token = this.jwt.createToken(60);
          fetch(this.client.apiUrl + '/add-favorite', {
            method: 'POST',
            headers: {
              'Content-Type':'application/json',
              'Authorization':'Bearer '+token
            },
            body: JSON.stringify({
              tag: tag,
              url: url,
              title: data.title
            })
          })
          .then(res => res.json())
          .then(data => {
            console.log('Response ->\n\t', data);
            if (!data.error) {
              this.message = data.message;
              this.messageType = "success";
              
              this.addFavoriteForm = new FormGroup({
                tag: new FormControl(''),
                url: new FormControl('', Validators.required)
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
          this.message = "Site not found. Please use a different URL or try later.";
          this.messageType = "error";
          this.showMessage = true;
          setTimeout(() => {this.showMessage = false;}, 7000);
        }
      })
      .catch(error => {
        console.error('Error:', error.message);
        this.message = "An error occurred. Please use a different URL or try later.";
        this.messageType = "error";
        this.showMessage = true;
        setTimeout(() => {this.showMessage = false;}, 7000);
      })
    }
  }
}
