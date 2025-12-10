import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../models/cart-item.interface';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-item.html',
  styleUrl: './cart-item.css'
})
export class CartItemComponent {
  @Input() item!: CartItem;
  @Output() quantityChange = new EventEmitter<{ id: number, quantity: number }>();
  @Output() removeItem = new EventEmitter<number>();

  increaseQuantity() {
    this.quantityChange.emit({ id: this.item.id, quantity: this.item.quantity + 1 });
  }

  decreaseQuantity() {
    if (this.item.quantity > 1) {
      this.quantityChange.emit({ id: this.item.id, quantity: this.item.quantity - 1 });
    }
  }

  onRemove() {
    this.removeItem.emit(this.item.id);
  }
}
