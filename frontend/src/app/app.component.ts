import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  menuIcon: string = "menu-icon.png";
  menuDisplayed: boolean = false;

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
}
