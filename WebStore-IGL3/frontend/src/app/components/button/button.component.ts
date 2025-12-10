import { Component,Input } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-button',
  imports: [],
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class Button {
  @Input() label: string = 'Click';
  @Input() routerLink?: string ;
  constructor(private router: Router) {}
  onClick() {
  if (this.routerLink) {
    this.router.navigate([this.routerLink]);
  }
}


}
