document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    document.getElementById("addProductButton")?.addEventListener("click", openAddProductModal);
    document.getElementById("closeModalButton")?.addEventListener("click", closeAddProductModal);
});

// 🔹 Fetch Products with Authentication
async function fetchProducts() {
    const token = localStorage.getItem("token");
    console.log("🔹 Token Sent:", token); // Debugging: Check token

    if (!token) {
        alert("Unauthorized! Please log in.");
        window.location.href = "index.html"; // Redirect to login
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/products", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch products");

        const products = await response.json();
        console.log("🔹 Products received:", products); // Debugging: Check response

        const productList = document.getElementById("productList");
        productList.innerHTML = "";

        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.innerHTML = `
                <img src="${product.image || 'default-image.jpg'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p><strong>Price:</strong> $${product.price}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Stock:</strong> ${product.stock > 0 ? 'Available' : 'Out of Stock'}</p>
                <div class="product-actions">
                    <button class="edit-product">Edit</button>
                    <button class="delete-product" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            `;
            productList.appendChild(productCard);
        });
    } catch (error) {
        console.error("❌ Error fetching products:", error);
    }
}

// 🔹 Open and Close Product Modal
function openAddProductModal() {
    document.getElementById("addProductModal").style.display = "block";
}
function closeAddProductModal() {
    document.getElementById("addProductModal").style.display = "none";
}

// 🔹 Register User
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    try {
        const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ User registered successfully!");
            window.location.href = "index.html"; // Redirect to login
        } else {
            document.getElementById("errorMessage").textContent = data.error || "Registration failed";
        }
    } catch (error) {
        console.error("❌ Error:", error);
        document.getElementById("errorMessage").textContent = "An error occurred. Please try again.";
    }
});
function redirectToRegister(event) {
    event.preventDefault(); // Prevent default button behavior
    window.location.href = "register.html"; // Redirect to the register page
}

// 🔹 Login User
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".button1")?.addEventListener("click", async function (event) {
        event.preventDefault();

        const username = document.querySelector(".input-field[type='text']").value.trim();
        const password = document.querySelector(".input-field[type='password']").value.trim();

        if (!username || !password) {
            alert("❌ Please enter both username and password.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            console.log("🔹 Login Response:", data); // Debugging: Log full response

            if (response.ok) {
                localStorage.setItem("token", data.accessToken); // Ensure correct token key
                localStorage.setItem("role", data.role);
                window.location.href = "products.html"; // Redirect to product listing
            } else {
                alert(`❌ Login failed: ${data.error}`);
            }
        } catch (error) {
            console.error("❌ Login error:", error);
            alert("An error occurred. Please try again.");
        }
    });
});

// 🔹 Delete Product (Admin Only)
async function deleteProduct(productId) {
    const token = localStorage.getItem("token");

    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const response = await fetch(`http://localhost:5000/products/${productId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ Product deleted successfully!");
            fetchProducts(); // Refresh product list
        } else {
            alert(`❌ Failed to delete: ${data.error}`);
        }
    } catch (error) {
        console.error("❌ Delete product error:", error);
    }
}

// 🔹 Logout User
document.getElementById("logoutButton")?.addEventListener("click", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("❌ No user logged in.");
        return;
    }

    fetch("http://localhost:5000/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    })
    .then(response => response.json())
    .then(data => {
        alert("✅ Logged out successfully!");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "index.html"; // Redirect to login
    })
    .catch(error => console.error("❌ Logout error:", error));
});
