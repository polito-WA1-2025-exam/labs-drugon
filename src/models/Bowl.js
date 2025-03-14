class Bowl {
    constructor(id, size, base, proteins, ingredients, quantity = 1) {
        this.id = id;
        this.size = size;
        this.base = base;
        this.proteins = proteins;
        this.ingredients = ingredients;
        this.quantity = quantity;
    }
}

export default Bowl;
