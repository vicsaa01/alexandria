import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { apiURL } from '../app.component';

@Component({
  selector: 'app-add-favorite-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-favorite-page.component.html',
  styleUrl: './add-favorite-page.component.css'
})
export class AddFavoritePageComponent {
  addFavoriteForm = new FormGroup({
    user_id: new FormControl('', Validators.required),
    tag: new FormControl('', Validators.required),
    url: new FormControl('', Validators.required)
  });
  formError = false;

  submitForm() {
    var user_id = '0'; // Default user ID
    var tag = this.addFavoriteForm.value.tag ?? '';
    var url = this.addFavoriteForm.value.url ?? '';

    console.log('\"Add Favorite\" form submitted ->\n\tUser ID: ' + user_id + '\n\tTag: ' + tag + '\n\tURL: ' + url);

    if (url == '') {
      this.formError = true;
      alert('URL must be a non empty string');
    } else {
      this.formError = false;

      // Fetch site title (and icon)
      fetch(apiURL + '/get-site-info?url=' + url)
      .then(response => response.json())
      .then(data => {
        console.log("Site fetch response ->\n\t", data);
        if (data.title) {
          if (tag == '') tag = data.title;

          // Send data to API
          fetch(apiURL + '/add-favorite', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
              user_id: user_id,
              tag: tag,
              url: url,
              title: data.title
            })
          })
          .then(response => response.json())
          .then(data => {
            console.log('Response ->\n\t', data);
            alert(data.message);

            this.addFavoriteForm = new FormGroup({
              user_id: new FormControl('', Validators.required),
              tag: new FormControl('', Validators.required),
              url: new FormControl('', Validators.required)
            });
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
