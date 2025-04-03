import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';

@Component({
  selector: 'app-extended-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './extended-table.component.html',
  styleUrl: './extended-table.component.css'
})
export class ExtendedTableComponent extends DefaultTableComponent {
  favorite_id: any;
  favorite_tag: string = '';
  showListMenu: boolean = false;
  showTagMenu: boolean = false;
  showRemoveMenu: boolean = false;

  myLists: { _id: any; user_id: string; name: string; dateAdded: string; }[] = [];
  editTagForm: FormGroup = new FormGroup({
    new_tag: new FormControl('', Validators.required)
  });
  formError = false;


  // Constructor

  constructor(protected override client: Client, protected override jwt: JSONWebToken) {super(client, jwt);}


  // Open/close menus

  openListMenu(id: any, tag: string): void {
    this.showListMenu = true;
    this.favorite_id = id;
    this.favorite_tag = tag;

    if (this.showListMenu) {
      const token = this.jwt.createToken(60);
      fetch(this.client.apiUrl + '/my-lists', {
        method: 'GET',
        headers: {'Authorization':'Bearer ' + token}
      })
      .then(res => res.json())
      .then((data) => {
        this.myLists = data;
      })
      .catch(error => console.error('Error: ', error));
    }
  }

  openTagMenu(id: any, tag: string): void {
    this.showTagMenu = true;
    this.favorite_id = id;
    this.favorite_tag = tag;
  }

  openRemoveMenu(id: any, tag: string): void {
    this.showRemoveMenu = true;
    this.favorite_id = id;
    this.favorite_tag = tag;
  }

  closeMenu(): void {
    this.showListMenu = false;
    this.showTagMenu = false;
    this.showRemoveMenu = false;
  }


  // Operations

  addToList(id: any): void {
    fetch(this.client.apiUrl + '/add-to-list', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        favorite_id: this.favorite_id.$oid,
        list_id: id.$oid
      })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      if (data.error != null) {
        console.error('Error: ', data.error);
      }
      this.showListMenu = false;
    })
    .catch(error => console.error('Error: ', error));
  }

  editTag(id: any): void {
    var new_tag = this.editTagForm.value.new_tag ?? '';
    console.log('\"Edit tag\" form submitted ->\n\tFavorite ID: ' + id.$oid + '\n\tNew tag: ' + new_tag);

    if (new_tag === '' || new_tag === this.favorite_tag) {
      this.formError = true;
      alert('Please enter a new tag');
      return;
    } else {
      this.formError = false;

      // Generate JWT token
      const token = this.jwt.createToken(60);

      // Send to API
      fetch(this.client.apiUrl + '/edit-tag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          favorite_id: id.$oid,
          new_tag: new_tag
        })
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        this.editTagForm = new FormGroup({
          new_tag: new FormControl('', Validators.required)
        });
        window.location.reload();
      })
      .catch(error => {
        console.error('Error: ', error.message);
        alert("Server did not respond. Please try again later.");
      })
    }
  }

  remove(id: any): void {
    fetch(this.client.apiUrl + '/remove-favorite', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        favorite_id: id.$oid
      })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      window.location.reload();
    })
    .catch(error => {
      console.error('Error: ', error.message);
      alert("Server did not respond. Please try again later.");
    });
  }
}
