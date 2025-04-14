// /models/Shop.mjs

export default function Shop() {
    // Create a new shop
    this.createShop = (name, address, openingHours, id = null) => {
        return {
            id,              // Will be set by the collection
            name,           // Shop name
            address,        // Shop address
            openingHours,   // Opening hours as JSON string or object
            isActive: true, // Whether the shop is currently active
            createdAt: new Date()
        };
    };

    // Validate shop data
    this.validateShop = (shop) => {
        if (shop.id !== null && (typeof shop.id !== 'number' || shop.id < 1)) {
            throw new Error('Invalid shop ID');
        }

        if (!shop.name || typeof shop.name !== 'string' || shop.name.trim().length === 0) {
            throw new Error('Shop must have a valid name');
        }

        if (!shop.address || typeof shop.address !== 'string' || shop.address.trim().length === 0) {
            throw new Error('Shop must have a valid address');
        }

        if (!shop.openingHours || (typeof shop.openingHours !== 'string' && typeof shop.openingHours !== 'object')) {
            throw new Error('Shop must have valid opening hours');
        }

        if (typeof shop.isActive !== 'boolean') {
            throw new Error('Shop must have a valid active status');
        }

        return true;
    };

    // Format shop data for display
    this.formatShop = (shop) => {
        return {
            ...shop,
            openingHours: typeof shop.openingHours === 'string' 
                ? JSON.parse(shop.openingHours) 
                : shop.openingHours,
            createdAt: shop.createdAt ? new Date(shop.createdAt) : new Date()
        };
    };

    // Check if shop is currently open
    this.isOpen = (shop) => {
        if (!shop.isActive) return false;

        const hours = typeof shop.openingHours === 'string' 
            ? JSON.parse(shop.openingHours) 
            : shop.openingHours;

        const now = new Date();
        const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        if (!hours[day]) return false;

        const currentTime = now.getHours() * 100 + now.getMinutes();
        const [open, close] = hours[day].split('-').map(time => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 100 + minutes;
        });

        return currentTime >= open && currentTime <= close;
    };

    // Get shop working days
    this.getWorkingDays = (shop) => {
        const hours = typeof shop.openingHours === 'string' 
            ? JSON.parse(shop.openingHours) 
            : shop.openingHours;
        
        return Object.keys(hours);
    };

    // Format opening hours for display
    this.formatOpeningHours = (shop) => {
        const hours = typeof shop.openingHours === 'string' 
            ? JSON.parse(shop.openingHours) 
            : shop.openingHours;

        return Object.entries(hours).map(([day, time]) => {
            return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${time}`;
        });
    };
} 