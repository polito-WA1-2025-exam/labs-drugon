// /models/Bowl.mjs

export default function Bowl() {
    // Create a new bowl
    this.createBowl = (size, base, proteins, ingredients, quantity, id = null) => {
        return {
            id,              // Will be set by the collection
            size,           // 'R', 'M', or 'L'
            base,           // 'rice', 'black rice', 'salad'
            proteins,       // array or comma-separated string
            ingredients,    // array or comma-separated string
            quantity,       // number
            createdAt: new Date()
        };
    };

    // Validate bowl data
    this.validateBowl = (bowl) => {
        // ID check is now optional since it will be set by the collection
        if (bowl.id !== null && (typeof bowl.id !== 'number' || bowl.id < 1)) {
            throw new Error('Invalid bowl ID');
        }

        const validSizes = ['R', 'M', 'L'];
        if (!validSizes.includes(bowl.size)) {
            throw new Error('Invalid bowl size');
        }

        const validBases = ['rice', 'black rice', 'salad'];
        if (!validBases.includes(bowl.base)) {
            throw new Error('Invalid bowl base');
        }

        if (!bowl.proteins || (typeof bowl.proteins !== 'string' && !Array.isArray(bowl.proteins))) {
            throw new Error('Bowl must have proteins');
        }

        if (!bowl.ingredients || (typeof bowl.ingredients !== 'string' && !Array.isArray(bowl.ingredients))) {
            throw new Error('Bowl must have ingredients');
        }

        if (typeof bowl.quantity !== 'number' || bowl.quantity < 0) {
            throw new Error('Invalid bowl quantity');
        }

        return true;
    };

    // Format bowl data for display
    this.formatBowl = (bowl) => {
        return {
            ...bowl,
            proteins: Array.isArray(bowl.proteins) ? bowl.proteins.join(',') : bowl.proteins,
            ingredients: Array.isArray(bowl.ingredients) ? bowl.ingredients.join(',') : bowl.ingredients,
            createdAt: bowl.createdAt ? new Date(bowl.createdAt) : new Date()
        };
    };

    // Helper method to parse comma-separated strings into arrays
    this.parseArrayField = (field) => {
        if (Array.isArray(field)) return field;
        return field.split(',').map(item => item.trim());
    };

    // Helper method to check if a bowl contains a specific ingredient
    this.hasIngredient = (bowl, ingredient) => {
        const ingredients = this.parseArrayField(bowl.ingredients);
        return ingredients.some(i => i.toLowerCase().includes(ingredient.toLowerCase()));
    };

    // Helper method to check if a bowl contains a specific protein
    this.hasProtein = (bowl, protein) => {
        const proteins = this.parseArrayField(bowl.proteins);
        return proteins.some(p => p.toLowerCase().includes(protein.toLowerCase()));
    };

    // Calculate bowl price based on size and ingredients
    this.calculatePrice = (bowl) => {
        const basePrices = {
            'R': 10.00,
            'M': 12.00,
            'L': 14.00
        };

        const proteinPrices = {
            'salmon': 3.00,
            'tuna': 3.00,
            'chicken': 2.00,
            'tofu': 1.50
        };

        let price = basePrices[bowl.size] || 0;
        
        // Add protein prices
        const proteins = this.parseArrayField(bowl.proteins);
        proteins.forEach(protein => {
            Object.entries(proteinPrices).forEach(([key, value]) => {
                if (protein.toLowerCase().includes(key)) {
                    price += value;
                }
            });
        });

        return price;
    };
} 