import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopUpMessageComponent } from '../pop-up-message/pop-up-message.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';

@Component({
  selector: 'app-lists-table',
  standalone: true,
  imports: [CommonModule, PopUpMessageComponent],
  templateUrl: './lists-table.component.html',
  styleUrl: './lists-table.component.css'
})
export class ListsTableComponent {
  @Input() columnNames: string[] = [];
  @Input() lists: { _id: any; user_id: string; name: string; dateAdded: string; }[] = [];
  showRemoveMenu: boolean = false;
  list_id: any;
  list_name: string = '';
  showMessage: boolean = false;
  message: string = "";
  messageType: string = "";

  constructor(private client: Client, private jwt: JSONWebToken) {}

  convertToDate(datetime: string): string {
    try {
      const [date, time]: string[] = datetime.split(' ');
      const [year, month, day]: string[] = date.split('-');
      if (parseInt(day) < 10) {
        if (parseInt(month) < 10) return day.slice(1) + '/' + month.slice(1) + '/' + year + ' ' + time;
        else return day.slice(1) + '/' + month + '/' + year + ' ' + time;
      }
      else {
        if (parseInt(month) < 10) return day + '/' + month.slice(1) + '/' + year + ' ' + time;
        else return day + '/' + month + '/' + year + ' ' + time;
      }
    } catch (error) {
      return "(No views)";
    }
  }

  openRemoveMenu(id: any, name: string): void {
    this.showRemoveMenu = true;
    this.list_id = id;
    this.list_name = name;
  }

  closeMenu(): void {
    this.showRemoveMenu = false;
  }

  remove(id: any): void {
    const token = this.jwt.createToken(60);
    fetch(this.client.apiUrl + '/remove-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization':'Bearer '+token
      },
      body: JSON.stringify({ id: id.$oid })
    })
    .then(res => res.json())
    .then((data) => {
      if (!data.error) {
        this.showRemoveMenu = false;
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
