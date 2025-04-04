import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';

@Component({
  selector: 'app-default-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './default-table.component.html',
  styleUrl: './default-table.component.css'
})
export class DefaultTableComponent {
  @Input() columnNames: string[] = [];
  @Input() sites: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];
  @Input() path: string = '';

  constructor(protected client: Client, protected jwt: JSONWebToken) {}

  convertToDuration(datetime: string): string {
    // Inputs
    const now: Date = new Date();
    const [date, time]: string[] = datetime.split(' ');
    const [year, month, day]: string[] = date.split('-');
    const [hh, mm]: string[] = time.split(':');

    // Subtractions
    var minutes: number = now.getMinutes() - parseInt(mm);
    var hours: number = now.getHours() - parseInt(hh);
    var days: number = now.getDate() - parseInt(day);
    var months: number = now.getMonth()+1 - parseInt(month);
    var years: number = now.getFullYear() - parseInt(year);
    
    // Corrections
    if (minutes < 0) {
      minutes += 60;
      if (hours !== 0) hours -= 1;
      else {hours += 23; days -= 1;}
    }
    if (hours < 0) {
      hours += 24;
      if (days !== 0) days -= 1;
      else {days += 29; /* depending on month */ months -= 1;}
    }
    if (days < 0) {
      days += 30; // depending on month
      if (months !== 0) months -= 1;
      else {months += 11; years -= 1;}
    }
    if (months < 0) {
      months += 12;
      if (years !== 0) years -= 1;
    }

    // Conditional return
    if (years !== 0) {
      if (years === 1) return years.toString() + " year ago";
      else return years.toString() + " years ago";
    }
    if (months !== 0) {
      if (months === 1) return months.toString() + " month ago";
      else return months.toString() + " months ago";
    }
    if (days !== 0) {
      if (days === 1) return days.toString() + " day ago";
      else return days.toString() + " days ago";
    }
    if (hours !== 0) {
      if (hours === 1) return hours.toString() + " hour ago";
      else return hours.toString() + " hours ago";
    }
    if (minutes !== 0) {
      if (minutes === 1) return minutes.toString() + " minute ago";
      else return minutes.toString() + " minutes ago";
    }
    return "<1 minute ago"
  }

  convertToDate(datetime: string): string {
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
  }

  viewSite(id: any, url: string): void {
    // Generate JWT token
    const token = this.jwt.createToken(60);

    // Fetch most viewed sites
    fetch(this.client.apiUrl + '/view-site?id=' + id.$oid, {
      method: 'POST',
      headers: {'Authorization':'Bearer ' + token}
    })
    .then(res => res.json())
    .then(data => {
      console.log(data.message);
      window.location.href = url;
    })
  }
}
