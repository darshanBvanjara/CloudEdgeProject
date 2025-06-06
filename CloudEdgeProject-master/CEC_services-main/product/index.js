const express = require("express");
const cors = require("cors");
const connectDB = require("./db.js");
const dotenv = require("dotenv");
const redis = require("./redis");
const Product = require("./productModel.js");
const axios = require("axios");

const app = express();
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'product' });
});
dotenv.config();

app.use(cors());
app.use(express.json());

app.get("/test", async (req, res) => {
    res.json("OK", 200);
});

const verifyRole = (allowedRoles) => async (req, res, next) => {
    try {
        console.log("Checking if role allowed [to auth service]");
        console.log("Allowed roles: ", allowedRoles);
        console.log("Headers: ", req.headers);
        await axios.post(
            "http://auth-service:3000/verifyRole",
            { roles: allowedRoles },
            { headers: { Authorization: req.headers?.authorization } }
        );
        next();
    } catch (err) {
        const status = err.response?.status || 500;
        const message =
            err.response?.data?.message || "Authorizationnnn failed";
        console.log("Authorization failed : Insufficient permissions.");
        console.log(err);
        return res.status(status).json({ message });
    }
};

app.get("/products", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const cacheKey = `products:page:${page}:limit:${limit}`;

    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log("Fetched from redis cache!");
            return res.status(200).json(JSON.parse(cachedData));
        }

        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product.find().skip(skip).limit(limit),
            Product.countDocuments(),
        ]);

        const response = {
            page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
            products,
        };

        await redis.set(cacheKey, JSON.stringify(response), "EX", 60); // Cache for 60s

        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

app.post("/product", verifyRole(["admin", "employee"]), async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        console.log("Adding new product:", req.body);

        const product = await Product.create({
            name,
            description,
            price,
            category,
            stock,
        });
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete(
    "/delete/:id",
    verifyRole(["admin", "employee"]),
    async (req, res) => {
        try {
            console.log("Deleting product...");
            const deletedProduct = await Product.findByIdAndDelete(
                req.params.id
            );

            if (!deletedProduct) {
                return res.status(404).json({ message: "Product not found" });
            }

            res.status(200).json({
                message: "Product deleted successfully",
                product: deletedProduct,
            });
        } catch (err) {
            res.status(500).json({
                error: "Server error",
                details: err.message,
            });
        }
    }
);

app.put("/update/:id", verifyRole(["admin", "employee"]), async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (err) {
        res.status(400).json({ error: "Update failed", details: err.message });
    }
});

connectDB()
    .then(() => {
        console.log("✅ Connected to MongoDB");

        app.listen(process.env.PORT, () => {
            console.log(
                `🚀 Product service is running on http://localhost:${process.env.PORT}`
            );
        });
    })
    .catch((err) => {
        console.error("❌ Failed to connect to MongoDB:", err);
        process.exit(1);
    });
