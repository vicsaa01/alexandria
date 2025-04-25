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
  currentMode: boolean = true;
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
        fetch(this.client.httpsUrl + '/current-settings', {
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
          this.currentMode = data.hasDarkMode;
          this.settingsForm = new FormGroup({
            username: new FormControl(''),
            hasDarkMode: new FormControl(this.currentMode)
          });
        })
        .catch((error) => {
          console.log('Error: ' + error.message);
        });
    } else {
        alert("Your session is invalid. Please log in correctly.");
    }
  }

  async submitForm(): Promise<void> {
    var newUsername = this.settingsForm.value.username ?? '';
    var newMode = this.settingsForm.value.hasDarkMode ?? this.currentMode;

    console.log('\"Change settings\" form submitted ->\n\tNew username: ' + newUsername + '\n\tDark mode?: ' + newMode);
    this.showMessage = false;

    const token = await this.jwt.createValidatedToken(60);
    if (token !== "Invalid session") {
      if ((newUsername === this.currentUsername || newUsername === "") /* && newMode === this.currentMode */) {
        this.message = "No changes have been made";
        this.messageType = "error";
        this.showMessage = true;
        setTimeout(() => {this.showMessage = false;}, 5000);
      } else {
        fetch(this.client.httpsUrl + '/change-settings', {
          method: 'POST',
          headers: {
            'Content-Type':'application/json',
            'Authorization':'Bearer '+token
          },
          body: JSON.stringify({
            username: newUsername,
            hasDarkMode: newMode
          })
        })
        .then(res => res.json())
        .then(data => {
          console.log('Response ->\n\t', data);
          if (!data.error) {
            this.message = data.message;
            this.messageType = "success";
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
      }
    }
  }

}
