import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';
import { Product } from '../common/product';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] =[];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  storage: Storage = localStorage;//sessionStorage;
  
  constructor() {

    let data = JSON.parse(this.storage.getItem('cartItems') || '[]');

    if(data != null) {
      this.cartItems = data;
      this.computeCartTotals();
    }

   }

  addToCart(theCartItem: CartItem) {
    let alreadyExistingInCart: boolean =false;
    let existingCartItem: CartItem = new CartItem(new Product);

    if(this.cartItems.length > 0) {
      for(let ci of this.cartItems){
        if(ci.id === theCartItem.id) {
          existingCartItem = ci;
          alreadyExistingInCart = true;
          break;
        }
      }
    }

    if(alreadyExistingInCart) {
      existingCartItem.quantity++;
    } else {
      this.cartItems.push(theCartItem);
    }

    this.computeCartTotals();
  }

  computeCartTotals() {
    let totalPriceValue: number =0;
    let totalQuantityValue: number =0;

    for(let ci of this.cartItems) {
      totalPriceValue += ci.quantity * ci.unitPrice;
      totalQuantityValue += ci.quantity;
    }

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.persistCartItems();
  }

  
  decrementQuantity(cartItem: CartItem) {
    cartItem.quantity--;
    if(cartItem.quantity ===0) {
      this.remove(cartItem);
    } else {
      this.computeCartTotals();
    }
  }

  remove(cartItem: CartItem) {
    const itemIndex = this.cartItems.findIndex( tci => tci.id === cartItem.id);
    if(itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

}
