require("dotenv").config();

const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 8000;


// ================= DATABASE =================

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("Mongo Error:", err));


// ================= SCHEMA =================

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },

        lastName: {
            type: String,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        jobTitle: {
            type: String,
        },

        gender: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("user", userSchema);


// ================= MIDDLEWARE =================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Logger middleware

app.use((req, res, next) => {
    fs.appendFile(
        "log.txt",
        `${Date.now()}:${req.ip}: ${req.method}: ${req.path}\n`,
        (err) => {
            next();
        }
    );
});


// ================= HTML ROUTE =================

app.get("/users", async (req, res) => {
    const allDbUser = await User.find({});

    const html = `
        <ul>
            ${allDbUser
                .map(
                    (user) =>
                        `<li>${user.firstName} - ${user.email}</li>`
                )
                .join("")}
        </ul>
    `;

    return res.send(html);
});


// ================= GET ALL USERS =================

app.get("/api/users", async (req, res) => {
    const allDbUser = await User.find({});

    res.setHeader("X-myName", "Subodh soni");

    return res.json(allDbUser);
});


// ================= GET SINGLE USER =================

app.get("/api/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        return res.json(user);

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Invalid user ID",
        });
    }
});


// ================= UPDATE USER =================

app.patch("/api/users/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        return res.json({
            status: "success",
            message: "User updated successfully",
            user: user,
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                status: "error",
                message: "Email already exists",
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Failed to update user",
        });
    }
});


// ================= DELETE USER =================

app.delete("/api/users/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        return res.json({
            status: "success",
            message: "User deleted successfully",
            user: user,
        });

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Invalid user ID",
        });
    }
});


// ================= CREATE USER =================

app.post("/api/users", async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            gender,
            job_title,
        } = req.body;

        if (
            !first_name ||
            !last_name ||
            !email ||
            !gender ||
            !job_title
        ) {
            return res.status(400).json({
                status: "error",
                message: "All fields are required",
            });
        }

        const user = await User.create({
            firstName: first_name,
            lastName: last_name,
            email: email,
            gender: gender,
            jobTitle: job_title,
        });

        return res.status(201).json({
            status: "success",
            message: "User created successfully",
            user: user,
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                status: "error",
                message: "Email already exists",
            });
        }

        return res.status(500).json({
            status: "error",
            message: "Something went wrong",
        });
    }
});


// ================= SERVER =================

app.listen(PORT, () => {
    console.log(`Server Started at port: ${PORT}`);
});