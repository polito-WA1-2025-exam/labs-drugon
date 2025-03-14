// /models/Bowl.js
class Bowl {
    constructor(id, size, base, proteins, ingredients, quantity) {
      this.id = id;
      this.size = size;               // 'R', 'M', or 'L'
      this.base = base;               // 'rice', 'black rice', 'salad'
      this.proteins = proteins;       // array or comma-separated string
      this.ingredients = ingredients; // array or comma-separated string
      this.quantity = quantity;       // number
    }
  }
  
  export default Bowl;
  