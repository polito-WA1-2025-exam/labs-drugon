import Shop from '../models/Shop.js';

class ShopManager {
    constructor() {
        this.shop = new Shop();
    }
    
    // Check if bowl size is available
    isSizeAvailable(size, quantity) {
        return this.shop.availableSizes[size] >= quantity;
    }
    
    // Update available sizes after order
    updateAvailableSizes(order) {
        // Count bowls by size
        const sizeCounts = {'R': 0, 'M': 0, 'L': 0};
        for (const bowl of order.bowls) {
            sizeCounts[bowl.size] += bowl.quantity;
        }
        
        // Update available sizes
        for (const size in sizeCounts) {
            this.shop.availableSizes[size] -= sizeCounts[size];
        }
    }
    
    // Validate bowl configuration
    validateBowl(bowl) {
        // Validate base
        if (!this.shop.bases.includes(bowl.base)) {
            return { valid: false, message: 'Invalid base selected.' };
        }
        
        // Validate proteins
        for (const protein of bowl.proteins) {
            if (!this.shop.proteins.includes(protein)) {
                return { valid: false, message: 'Invalid protein selected.' };
            }
        }
        
        // Validate protein count based on bowl size
        const requiredProteins = bowl.size === 'R' ? 1 : (bowl.size === 'M' ? 2 : 3);
        if (bowl.proteins.length !== requiredProteins) {
            return { valid: false, message: `${bowl.size} bowl requires exactly ${requiredProteins} proteins.` };
        }
        
        // Validate ingredients
        if (bowl.ingredients.length < 1) {
            return { valid: false, message: 'At least one ingredient is required.' };
        }
        
        for (const ingredient of bowl.ingredients) {
            if (!this.shop.ingredients.includes(ingredient)) {
                return { valid: false, message: 'Invalid ingredient selected.' };
            }
        }
        
        return { valid: true };
    }
}

export default ShopManager;