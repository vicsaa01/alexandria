import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title: string = "TheGateWeb";
  menuIcon: string = "menu-icon.png";
  menuDisplayed: boolean = false;
  loggedIn: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (localStorage.getItem('sessionToken') != null && localStorage.getItem('userID') != null) {
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }
  }

  toggleMenu(): void {
    var menu: HTMLElement | null = document.getElementById("dropdownMenu");
    
    if (this.menuDisplayed) {
      if (menu != null) menu.style.display = "none";
      this.menuIcon = 'menu-icon.png'
      this.menuDisplayed = false
    }
    else {
      if (menu != null) menu.style.display = "block";
      this.menuIcon = 'cancel-icon.png'
      this.menuDisplayed = true
    }
  }

  logout(): void {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userID');
    window.location.assign('/');
  }
}