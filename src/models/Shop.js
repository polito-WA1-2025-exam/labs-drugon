class Shop {
    constructor() {
        this.availableSizes = {
            'R': 10,  // 10 Regular bowls available
            'M': 8,   // 8 Medium bowls available
            'L': 6    // 6 Large bowls available
        };
        
        this.prices = {
            'R': 9,   // Regular bowl price: 9€
            'M': 11,  // Medium bowl price: 11€
            'L': 14   // Large bowl price: 14€
        };
        
        this.bases = ['rice', 'black rice', 'salad'];
        this.proteins = ['tuna', 'chicken', 'salmon', 'tofu'];
        this.ingredients = ['avocado', 'ananas', 'cashew nuts', 'kale', 'mango', 
                           'peppers', 'corn', 'wakame', 'tomatoes', 'carrots', 'salad'];
    }
}

export default Shop;