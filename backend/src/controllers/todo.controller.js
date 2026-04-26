// controllers/todo.controller.js
const Todo = require("../models/Todo");

// @desc    Get all todos for logged-in user
// @route   GET /todos
// @access  Private
// exports.getAll = async (req, res) => {
//     try {
//         const todos = await Todo.find({ user: req.user.id })
//             .sort({ createdAt: -1 }) // Newest first
//             .lean();

//         res.json(todos);
//     } catch (err) {
//         console.error("[todo/getAll] error:", err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };


// controllers/todo.controller.js - UPDATE getAll

exports.getAll = async (req, res) => {
    try {
        // Get pagination params from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        // Get search/filter params
        const search = req.query.search || '';
        const status = req.query.status; // 'completed' | 'pending' | undefined

        // Build filter
        const filter = { user: req.user.id };

        if (search) {
            filter.title = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        if (status === 'completed') {
            filter.completed = true;
        } else if (status === 'pending') {
            filter.completed = false;
        }

        // Run both queries in parallel for speed
        const [todos, total] = await Promise.all([
            Todo.find(filter)
                .sort({ createdAt: -1 })  // Newest first
                .skip(skip)               // Skip previous pages
                .limit(limit)             // Only return 5
                .lean(),

            Todo.countDocuments(filter) // Total count for pagination
        ]);

        res.json({
            todos,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasMore: page < Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("[todo/getAll] error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};


// @desc    Get single todo
// @route   GET /todos/:id
// @access  Private
exports.getById = async (req, res) => {
    try {
        const todo = await Todo.findOne({
            _id: req.params.id,
            user: req.user.id, // Security: only owner can view
        }).lean();

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.json(todo);
    } catch (err) {
        console.error("[todo/getById] error:", err);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ message: "Todo not found" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Create new todo
// @route   POST /todos
// @access  Private
exports.create = async (req, res) => {
    try {
        const { title, description, completed } = req.body;

        if (!title || title.trim().length === 0) {
            return res.status(400).json({ message: "Title is required" });
        }

        const todo = await Todo.create({
            title: title.trim(),
            description: description?.trim() || "",
            completed: completed || false,
            user: req.user.id, // Always assign to logged-in user
        });

        res.status(201).json(todo);
    } catch (err) {
        console.error("[todo/create] error:", err);
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(", ") });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Update todo
// @route   PUT /todos/:id
// @access  Private
exports.update = async (req, res) => {
    try {
        const { title, description, completed } = req.body;

        const todo = await Todo.findOne({
            _id: req.params.id,
            user: req.user.id, // Only owner can update
        });

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        // Update only provided fields
        if (title !== undefined) todo.title = title.trim();
        if (description !== undefined) todo.description = description.trim();
        if (completed !== undefined) todo.completed = completed;

        await todo.save();
        res.json(todo);
    } catch (err) {
        console.error("[todo/update] error:", err);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ message: "Todo not found" });
        }
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(", ") });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Delete todo
// @route   DELETE /todos/:id
// @access  Private
exports.remove = async (req, res) => {
    try {
        const todo = await Todo.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id, // Only owner can delete
        });

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.json({ message: "Todo deleted" });
    } catch (err) {
        console.error("[todo/remove] error:", err);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ message: "Todo not found" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Toggle todo completion
// @route   PATCH /todos/:id/toggle
// @access  Private
exports.toggle = async (req, res) => {
    try {
        const todo = await Todo.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        todo.completed = !todo.completed;
        await todo.save();
        res.json(todo);
    } catch (err) {
        console.error("[todo/toggle] error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};