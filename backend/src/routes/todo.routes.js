// routes/todo.routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const todoController = require("../controllers/todo.controller");

// All routes require authentication
router.use(authMiddleware);

// CRUD Routes
router.get("/", todoController.getAll);          // GET    /todos
router.get("/:id", todoController.getById);      // GET    /todos/:id
router.post("/", todoController.create);         // POST   /todos
router.put("/:id", todoController.update);       // PUT    /todos/:id
router.delete("/:id", todoController.remove);    // DELETE /todos/:id

// Bonus: Quick toggle
router.patch("/:id/toggle", todoController.toggle); // PATCH /todos/:id/toggle

module.exports = router;