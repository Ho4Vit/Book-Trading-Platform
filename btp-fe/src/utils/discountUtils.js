/**
 * Utility functions for discount calculations
 */

/**
 * Find applicable discount for a book (legacy - use getAvailableDiscountsForCart instead)
 * @param {number} bookId - The book ID
 * @param {Array} discounts - Array of all available discounts
 * @returns {Object|null} - The applicable discount or null
 */
export const findApplicableDiscount = (bookId, discounts) => {
    if (!discounts || !Array.isArray(discounts) || !bookId) return null;

    // Filter active discounts that haven't expired and include this book
    const now = new Date();
    const applicableDiscounts = discounts.filter(discount => {
        const isActive = discount.active;
        const notExpired = new Date(discount.expiryDate) > now;
        const appliesToBook = discount.applicableBookIds?.includes(bookId);

        return isActive && notExpired && appliesToBook;
    });

    // Return the discount with the highest value (if multiple apply)
    if (applicableDiscounts.length === 0) return null;

    return applicableDiscounts.reduce((best, current) => {
        const bestValue = best.percentage ? best.discountAmount : best.discountAmount;
        const currentValue = current.percentage ? current.discountAmount : current.discountAmount;
        return currentValue > bestValue ? current : best;
    });
};

/**
 * Calculate discounted price for a book
 * @param {number} originalPrice - Original book price
 * @param {Object} discount - The discount object
 * @returns {Object} - Object with discountedPrice and savedAmount
 */
export const calculateDiscountedPrice = (originalPrice, discount) => {
    if (!discount || !originalPrice) {
        return { discountedPrice: originalPrice, savedAmount: 0 };
    }

    let discountedPrice = originalPrice;
    let savedAmount = 0;

    if (discount.percentage) {
        // Percentage discount
        savedAmount = (originalPrice * discount.discountAmount) / 100;
        discountedPrice = originalPrice - savedAmount;
    } else {
        // Fixed amount discount
        savedAmount = discount.discountAmount;
        discountedPrice = Math.max(0, originalPrice - discount.discountAmount);
    }

    return {
        discountedPrice: Math.round(discountedPrice),
        savedAmount: Math.round(savedAmount)
    };
};

/**
 * Calculate total discount for cart items
 * @param {Array} cartItems - Array of cart items
 * @param {Array} discounts - Array of all available discounts
 * @returns {Object} - Object with totalOriginal, totalDiscounted, totalSaved
 */
export const calculateCartDiscount = (cartItems, discounts) => {
    if (!cartItems || cartItems.length === 0) {
        return { totalOriginal: 0, totalDiscounted: 0, totalSaved: 0 };
    }

    let totalOriginal = 0;
    let totalDiscounted = 0;

    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalOriginal += itemTotal;

        const discount = findApplicableDiscount(item.bookId, discounts);
        if (discount) {
            const { discountedPrice } = calculateDiscountedPrice(item.price, discount);
            totalDiscounted += discountedPrice * item.quantity;
        } else {
            totalDiscounted += itemTotal;
        }
    });

    return {
        totalOriginal: Math.round(totalOriginal),
        totalDiscounted: Math.round(totalDiscounted),
        totalSaved: Math.round(totalOriginal - totalDiscounted)
    };
};

/**
 * Calculate discount for selected cart items only
 * @param {Array} selectedItems - Array of selected cart items
 * @param {Object|null} appliedDiscount - The discount to apply
 * @returns {Object} - Object with totalOriginal, totalDiscounted, totalSaved, canApplyDiscount
 */
export const calculateSelectedItemsDiscount = (selectedItems, appliedDiscount) => {
    if (!selectedItems || selectedItems.length === 0) {
        return {
            totalOriginal: 0,
            totalDiscounted: 0,
            totalSaved: 0,
            canApplyDiscount: false
        };
    }

    let totalOriginal = 0;
    let totalDiscounted = 0;
    let canApplyDiscount = false;

    selectedItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalOriginal += itemTotal;

        // Check if discount applies to this book
        if (appliedDiscount && appliedDiscount.applicableBookIds?.includes(item.bookId)) {
            const { discountedPrice } = calculateDiscountedPrice(item.price, appliedDiscount);
            totalDiscounted += discountedPrice * item.quantity;
            canApplyDiscount = true;
        } else {
            totalDiscounted += itemTotal;
        }
    });

    return {
        totalOriginal: Math.round(totalOriginal),
        totalDiscounted: Math.round(totalDiscounted),
        totalSaved: Math.round(totalOriginal - totalDiscounted),
        canApplyDiscount
    };
};

/**
 * Validate if discount meets minimum order value requirement
 * @param {Object} discount - The discount object
 * @param {number} orderValue - The order total value
 * @returns {boolean} - True if discount can be applied
 */
export const canApplyDiscount = (discount, orderValue) => {
    if (!discount) return false;
    return orderValue >= (discount.minOrderValue || 0);
};


