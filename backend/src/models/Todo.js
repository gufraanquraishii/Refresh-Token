// models/Todo.js
const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: [1000, "Description too long"],
        },
        completed: {
            type: Boolean,
            default: false,
        },
        // Important: Link todos to users
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true, // Fast queries by user
        },
    },
    { timestamps: true } // Adds createdAt, updatedAt
);

// Users can only see their own todos (enforced by middleware)
// This prevents accidental exposure
todoSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Todo", todoSchema);