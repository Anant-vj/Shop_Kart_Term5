const mongoose = require('mongoose');

/**
 * Task 1: Order Data Model (Lab 06 - 15 Marks)
 * Represents a persistent, snapshot-based historical record of an order.
 * Crucial Design Decision:
 * Product name, price, and image are SNAPSHOTTED at the moment of order creation.
 * If product prices or names change in the future, the order retains the exact
 * pricing and details that the customer paid at checkout.
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'User reference is required for every order'],
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product reference is required'],
        },
        name: {
          type: String,
          required: [true, 'Product name snapshot is required'],
        },
        price: {
          type: Number,
          required: [true, 'Product price snapshot is required'],
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1'],
        },
        image: {
          type: String,
        },
      },
    ],

    shippingAddress: {
      fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
      },
      addressLine1: {
        type: String,
        required: [true, 'Address line 1 is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        trim: true,
      },
    },

    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required and must be calculated server-side'],
    },

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },

    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'],
      default: 'PENDING_PAYMENT',
    },

    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
