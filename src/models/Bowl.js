function Bowl(id, size, base, proteins, ingredients, quantity = 1) {
    this.id = id;
    this.size = size;            // 'R', 'M', or 'L'
    this.base = base;            // 'rice', 'black rice', or 'salad'
    this.proteins = proteins;    // Array of selected proteins
    this.quantity = quantity;    // Number of identical bowls
    this.ingredients = ingredients;  // Array of selected ingredients
    this.specialRequests = '';   // Optional special requests or allergies
  }