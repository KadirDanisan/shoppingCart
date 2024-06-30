const cartBtn = document.querySelector(".cart-btn");
const clearCartBtn = document.querySelector(".btn-clear");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".total-value");
const cartContent = document.querySelector(".cart-list");
const productsDOM = document.querySelector("#products-dom");

let buttonsDom = [];
let cart = [];

class Products{
  async getProducts(){
    try{
       let result = await fetch("https://6680499a56c2c76b495bb099.mockapi.io/products");
       let data = await result.json();
       console.log(data);
       return data;
    }catch(error){
        console.log(error);
    }
  }
}

class UI{
   displayProducts(data){
     let result = "";
     data.forEach(item => {
        result += `
          <div class="col-lg-4 col-md-6">
            <div class="product">
              <div class="product-image">
                <img src="${item.image}" alt="product" />
              </div>
              <div class="product-hover">
                <span class="product-title"> ${item.title} </span>
                <span class="product-title">$ ${item.price} </span>
                <button class="btn-add-to-cart" data-id=${item.id}>
                  <i class="fas fa-cart-shopping"></i>
                </button>
              </div>
            </div>
          </div>
        `;
     });

     productsDOM.innerHTML = result;
   }

   getBagButtons(){
    // buttonların hepsini alabilmek için yazdık
    const buttons = [...document.querySelectorAll(".btn-add-to-cart")];
    buttonsDom = buttons;
    console.log(buttonsDom);
    buttons.forEach(button =>{
        let id = button.dataset.id;
        console.log(id);
        let inCart = cart.find(item => item.id === id);
        console.log(inCart);
        if(inCart){
            // Sepetimizde Varsa Aynı item buttona tıklanmıyor
            button.setAttribute("disabled", "disabled");
            button.opacity = ".3";
        }else{
            //  sepetimizde yoksa item sepete ekliyoruz
            button.addEventListener("click", event =>{
               event.target.disabled = true;
               event.target.style.opacity = ".3";
               //* get product from products
               let cartItem = {...Storage.getProduct(id), amount: 1}; 
               //* add product to the cart          
               cart = [...cart, cartItem];
               //* save cart ın local storage
               Storage.saveCart(cart);
               console.log(cart);
               //* save cart values
               this.saveCartValues(cart);
               //* display cart item
               this.addCartItem(cartItem);
               //* show the cart
               this.showCart();
            });
        }
    })
   }

   saveCartValues(cart){
      let tempTotal = 0;
      let itemsTotal = 0;
      cart.map(item => {
        tempTotal += item.price * item.amount;
        itemsTotal += item.amount;
      });

      cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
      cartItems.innerText = itemsTotal;
   }

   addCartItem(item){
    const li = document.createElement("li");
    li.classList.add("cart-list-item");
    li.innerHTML = `
            <div class="cart-left">
                <div class="cart-left-image">
                  <img src="${item.image}" alt="product" />
                </div>
                <div class="cart-left-info">
                  <a class="cart-left-info-title" href="#">${item.title}</a>
                  <span class="cart-left-info-price">$ ${item.price}</span>
                </div>
              </div>
              <div class="cart-right">
                <div class="cart-right-quantity">
                  <button class="quantity-minus" data-id=${item.id}>
                    <i class="fas fa-minus"></i>
                  </button>
                  <span class="quantity">${item.amount}</span>
                  <button class="quantity-plus" data-id=${item.id}>
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                <div class="cart-right-remove">
                  <button class="cart-remove-btn" data-id=${item.id}>
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
            </div>
    `;

    cartContent.appendChild(li);
    
   }

   showCart(){
     cartBtn.click();
   }

   setupApp(){
    cart = Storage.getCart();
    this.saveCartValues(cart);
    this.populateCart(cart);
   }

   populateCart(cart){
    cart.forEach(item => this.addCartItem(item));
   }

   cartLogic(){
      clearCartBtn.addEventListener("click", ()=>{
          this.clearCart();
      });

      cartContent.addEventListener("click", event => {
        if(event.target.classList.contains("cart-remove-btn")){
            let removeItem = event.target;
            let id = removeItem.dataset.id;
            removeItem.parentElement.parentElement.parentElement.remove();
            this.removeItem(id);
        }else if(event.target.classList.contains("quantity-minus")){
            let lowerAmount = event.target;
            let id = lowerAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount -1;
            if(tempItem.amount > 0){
                Storage.saveCart(cart);
                this.saveCartValues(cart);
                lowerAmount.nextElementSibling.innerText = tempItem.amount;
            }else{
                lowerAmount.parentElement.parentElement.parentElement.remove();
                this.removeItem(id);
            }
        }else if(event.target.classList.contains("quantity-plus")){
            let addAmount = event.target;
            let id = addAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount +1;
            Storage.saveCart(cart);
            this.saveCartValues(cart);
            addAmount.previousElementSibling.innerText = tempItem.amount;
        }
      });
   }

   clearCart(){
     let cartItems = cart.map(item => item.id);

     cartItems.forEach(id => this.removeItem(id));
     while(cartContent.children.length > 0){
        cartContent.removeChild(cartContent.children[0]);
     }
   }

   removeItem(id){
    cart = cart.filter(item => item.id !== id);
    this.saveCartValues(cart);
    Storage.saveCart(cart);

    let button = this.getSingleButton(id);
    button.disabled = false;
    button.style.opacity = "1";
   }

   getSingleButton(id){
     return buttonsDom.find(button => button.dataset.id === id);
   }
}

class Storage{
     static saveProducts(data){
        localStorage.setItem("data", JSON.stringify(data));
     }

     static getProduct(id){
        let data = JSON.parse(localStorage.getItem("data"));
        return data.find(data => data.id === id);
     }

     static saveCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart));
     }

     static getCart(){
       return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")): [];
     }
}

document.addEventListener("DOMContentLoaded", ()=>{
   const ui = new UI();
   const products = new Products();
   
   ui.setupApp();

   products.getProducts().then(data => {
    ui.displayProducts(data);
    Storage.saveProducts(data);
   })
   .then(()=>{
    ui.getBagButtons();
    ui.cartLogic();
   });
});