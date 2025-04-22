import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { PopUpMessageComponent } from '../pop-up-message/pop-up-message.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';

@Component({
  selector: 'app-list-items-table',
  standalone: true,
  imports: [CommonModule, PopUpMessageComponent],
  templateUrl: './list-items-table.component.html',
  styleUrl: './list-items-table.component.css'
})
export class ListItemsTableComponent extends DefaultTableComponent {
  @Input() list_id: string | null = '';
  @Input() isOwner: boolean = false;
  showMessage: boolean = false;
  message: string = "";
  messageType: string = "";

  // Add ActivatedRoute property when loading page
  constructor(private route: ActivatedRoute, protected override client: Client, protected override jwt: JSONWebToken) {
    super(client, jwt);
  }
  
  ngOnInit() {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.list_id = params.get('id');
    });
  }

  removeFromList(favorite_id: any): void {
    if (!this.list_id) {
      return;
    }

    const token = this.jwt.createToken(60);
    fetch(this.client.apiUrl + '/remove-from-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        favorite_id: favorite_id.$oid,
        list_id: this.list_id
      })
    })
    .then(res => res.json()) 
    .then((data) => {
      if (!data.error) {
        this.showMessage = false;
        window.location.reload();
      } else {
        this.message = data.error;
        this.messageType = "error";
        this.showMessage = true;
        setTimeout(() => {this.showMessage = false;}, 5000);
      }
    })
    .catch(error => {
      console.error('Error: ', error);
      this.message = error.message;
      this.messageType = "error";
      this.showMessage = true;
      setTimeout(() => {this.showMessage = false;}, 5000);
    });
  }
}
