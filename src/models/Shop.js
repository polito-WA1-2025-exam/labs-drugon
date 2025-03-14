// /models/Shop.js
class Shop {
    constructor(id, name, maxR, maxM, maxL) {
      this.id = id;
      this.name = name;   // e.g., "Lama Poke Shop"
      this.maxR = maxR;   // maximum # of Regular bowls per day
      this.maxM = maxM;   // maximum # of Medium bowls per day
      this.maxL = maxL;   // maximum # of Large bowls per day
    }
  }
  
  export default Shop;
  