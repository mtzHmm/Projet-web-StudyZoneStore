import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../../components/button/button.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports : [Button, CommonModule]
})
export class LandingComponent implements OnInit {
  isUserLoggedIn = false;

  constructor() {}

  ngOnInit() {
    this.isUserLoggedIn = false; // No authentication
  }
}
