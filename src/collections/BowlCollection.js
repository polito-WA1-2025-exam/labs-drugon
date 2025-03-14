import Bowl from '../models/Bowl.js';

class BowlCollection {
    constructor() {
        this.bowls = [];
        this.lastId = 0;
    }
    
    // Add a new bowl
    addBowl(size, base, proteins, ingredients, quantity = 1) {
        const id = ++this.lastId;
        const newBowl = new Bowl(id, size, base, proteins, ingredients, quantity);
        this.bowls.push(newBowl);
        return newBowl;
    }
    
    // Get bowl by ID
    getBowlById(id) {
        return this.bowls.find(bowl => bowl.id === id);
    }
    
    // Remove a bowl
    removeBowl(id) {
        const index = this.bowls.findIndex(bowl => bowl.id === id);
        if (index !== -1) {
            this.bowls.splice(index, 1);
            return true;
        }
        return false;
    }
    
    // Calculate price for a bowl
    calculateBowlPrice(bowl, shopPrices) {
        let basePrice = shopPrices[bowl.size];
        const maxIncludedIngredients = bowl.size === 'L' ? 6 : 4;
        const extraIngredients = Math.max(0, bowl.ingredients.length - maxIncludedIngredients);
        
        // Each extra ingredient adds 20% to the base price
        let totalPrice = basePrice * (1 + 0.2 * extraIngredients);
        return totalPrice * bowl.quantity;
    }
}

export default BowlCollection;