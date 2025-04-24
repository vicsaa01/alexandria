import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PopUpMessageComponent } from '../pop-up-message/pop-up-message.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopUpMessageComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css'
})
export class SettingsPageComponent {
  currentUsername: string = "";
  settingsForm: FormGroup = new FormGroup({
    username: new FormControl(''),
    hasDarkMode: new FormControl(true)
  });
  showMessage: boolean = false;
  message: string = "";
  messageType: string = "";

  constructor(private client: Client, private jwt: JSONWebToken) {}

  async ngOnInit(): Promise<void> {
    // Generate JWT token
    const token = await this.jwt.createValidatedToken(60);

    // Fetch recent sites
    if (token !== "Invalid session") {
        fetch(this.client.httpsUrl + '/my-username', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        })
        .then(res => res.json())
        .then((data) => {
          if (data.error) {
            console.log('Error: ' + data.error);
            return;
          }
          this.currentUsername = data.username;
        })
        .catch((error) => {
          console.log('Error: ' + error.message);
        });
    } else {
        alert("Your session is invalid. Please log in correctly.");
    }
  }

  async submitForm(): Promise<void> {
    var username = this.settingsForm.value.username ?? '';
    var hasDarkMode = this.settingsForm.value.hasDarkMode ?? '';

    console.log('\"Change settings\" form submitted ->\n\tNew username: ' + username + '\n\tDark mode?: ' + hasDarkMode);
  }
}
