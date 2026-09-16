const express = require("express");
const fs = require("fs");
const users = require("./MOCK_DATA.json");

const app = express();
const PORT = 8000;


// Middleware -- Pluggin
app.use(express.urlencoded({ extended: false}));

app.use((req, res, next) => {
    fs.appendFile('log.txt', `${Date.now()}:${req.ip}: ${req.method}: ${req.path}\n`, (err, data) => {
        next(); 
    })
    
   
});

app.use((req, res, next) => {
    console.log("Hello from middleware 2", );
    // return res.end("Hey");
    next();
    
});

// ROUTES

app.get("/users", (req, res) => {
    const html = `
        <ul>
            ${users.map(user => `<li>${user.first_name}</li>`).join("")}
        </ul>
    `;

    return res.send(html);
});

// REST API
app.get("/api/users", (req,res) => {
    // console.log(request.headers)
    res.setHeader("X-myName", "Subodh soni") // custom header
    // always add X to custom headers
    return res.json(users)
});

app
    .route("/api/users/:id")
    .get((req, res) => {

        const id = Number(req.params.id);

        const user = users.find((user) => user.id === id);

        return res.json(user);
    })

    .patch((req, res) => {
        // edit user with id
        const id = Number(req.params.id);

        const user = users.find((user) => user.id === id);

        if (!user) {
            return res.status(404).json({
                status: "User not found"
            });
        }

        Object.assign(user, req.body);

        fs.writeFile(
            "./MOCK_DATA.json",
            JSON.stringify(users, null, 2),
            (err) => {
                if (err) {
                    return res.status(500).json({
                        status: "Error",
                        message: "Failed to update user"
                    });
                }

                return res.json({
                    status: "success",
                    message: "User updated successfully",
                    user: user
                });
            }
        );
    })

    .delete((req, res) => {
        // delete user with id
        const id = Number(req.params.id);

        const index = users.findIndex((user) => user.id === id);

        if (index === -1) {
            return res.status(404).json({
                status: "User not found"
            });
        }

        const deletedUser = users.splice(index, 1);

        fs.writeFile(
            "./MOCK_DATA.json",
            JSON.stringify(users, null, 2),
            (err) => {
                if (err) {
                    return res.status(500).json({
                        status: "Error",
                        message: "Failed to delete user"
                    });
                }

                return res.json({
                    status: "success",
                    message: "User deleted successfully",
                    user: deletedUser[0]
                });
            }
        );
    });


// GET all users

app.get("/api/users", (req, res) => {
    return res.json(users);
});


// POST user

app.post("/api/users", (req, res) => {
    const body = req.body;

    console.log("Body", body);

    users.push({
        ...body,
        id: users.length + 1
    });

    fs.writeFile(
        "./MOCK_DATA.json",
        JSON.stringify(users),
        (err, data) => {
            return res.json({
                status: "success",
                id: users.length
            });
        }
    );
});


// SERVER

app.listen(PORT, () => {
    console.log(`Server Started at port: ${PORT}`);
});