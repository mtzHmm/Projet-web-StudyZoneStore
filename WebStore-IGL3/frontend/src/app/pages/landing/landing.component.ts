import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../../components/button/button.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports : [Button, CommonModule]
})
export class LandingComponent implements OnInit {
  isUserLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isUserLoggedIn = this.authService.isLoggedIn();
  }
}
