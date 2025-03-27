import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Client } from '../../client';

@Component({
  selector: 'app-add-favorite-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-favorite-page.component.html',
  styleUrl: './add-favorite-page.component.css'
})
export class AddFavoritePageComponent {
  addFavoriteForm: FormGroup = new FormGroup({
    user_id: new FormControl('', Validators.required),
    tag: new FormControl(''),
    url: new FormControl('', Validators.required)
  });
  formError: boolean = false;

  constructor(private client: Client, private router: Router) {}

  return(): void {
    this.router.navigate(['/favorites']); // go to previous url
  }

  submitForm(): void {
    var userID = localStorage.getItem('userID');
    var tag = this.addFavoriteForm.value.tag ?? '';
    var url = this.addFavoriteForm.value.url ?? '';
    console.log('\"Add Favorite\" form submitted ->\n\tUser ID: ' + userID + '\n\tTag: ' + tag + '\n\tURL: ' + url);

    if (url === '') {
      this.formError = true;
      alert('Please enter the site URL');
      return;
    } else {
      this.formError = false;

      // Fetch site title (and icon)
      fetch(this.client.apiUrl + '/get-site-info?url=' + url)
      .then(res => res.json())
      .then(data => {
        console.log("Site fetch response ->\n\t", data);
        if (data.title) {
          if (tag == '') tag = data.title;

          // Send data to API
          fetch(this.client.apiUrl + '/add-favorite', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
              userID: userID,
              tag: tag,
              url: url,
              title: data.title
            })
          })
          .then(res => res.json())
          .then(data => {
            console.log('Response ->\n\t', data);
            alert(data.message);

            this.addFavoriteForm = new FormGroup({
              userID: new FormControl('', Validators.required),
              tag: new FormControl(''),
              url: new FormControl('', Validators.required)
            });
          })
          .catch(error => {
            console.error('Error:', error.message);
            alert("Server did not respond. Please try again later.");
          })
        } else {
          alert("Site not found. Please use a different URL or try later.");
        }
      })
      .catch(error => {
        console.error('Error:', error.message);
        alert("An error occurred. Please use a different URL or try later.");
      })
    }
  }
}
