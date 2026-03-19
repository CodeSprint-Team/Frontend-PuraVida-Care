import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,LoginComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'PuraVidaCare';
}
