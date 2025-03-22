document.addEventListener("DOMContentLoaded", fetchProducts);

// Fetch and display products
async function fetchProducts() {
    const category = document.getElementById("searchCategory")?.value;
    const minPrice = document.getElementById("minPrice")?.value;
    const maxPrice = document.getElementById("maxPrice")?.value;
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    let url = "http://localhost:5000/products";
    const queryParams = [];

    if (category) queryParams.push(`category=${category}`);
    if (minPrice) queryParams.push(`minPrice=${minPrice}`);
    if (maxPrice) queryParams.push(`maxPrice=${maxPrice}`);

    if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
    }

    try {
        const response = await fetch(url);
        const products = await response.json();

        const productList = document.getElementById("productList");
        productList.innerHTML = "";

        products.forEach(product => {
            const productDiv = document.createElement("div");
            productDiv.classList.add("product-card");

            const productImage = product.image_url ? product.image_url : "placeholder.jpg";

            productDiv.innerHTML = `
                <img src="${productImage}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Price: $${product.price}</p>
                <p>Category: ${product.category}</p>
                <p>Stock: ${product.stock > 0 ? "Available" : "Out of Stock"}</p>
                ${(role === "admin" || product.seller_id == userId) ? `
                    <button class="edit-btn" onclick="openEditForm(${product.id}, '${product.name}', ${product.price}, '${product.category}', ${product.stock})">Edit</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
                ` : ""}
            `;

            productList.appendChild(productDiv);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// Delete a product
async function deleteProduct(productId) {
    const token = localStorage.getItem("token"); // Get token

    if (!token) {
        alert("❌ You are not logged in!");
        return;
    }

    console.log("🔹 Sending DELETE request for product ID:", productId);
    console.log("🔹 Token being sent:", token);

    try {
        const response = await fetch(`http://localhost:5000/products/${productId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        console.log("🔹 Server response:", data);

        if (response.ok) {
            alert("✅ Product deleted successfully!");
            fetchProducts(); // Refresh product list
        } else {
            alert(`❌ ${data.error || "Failed to delete product"}`);
        }
    } catch (error) {
        console.error("❌ Error deleting product:", error);
    }
}
// Open Add Product Modal
function openAddProductModal() {
    document.getElementById("addProductModal").style.display = "block";
}

// Close Add Product Modal
function closeAddProductModal() {
    document.getElementById("addProductModal").style.display = "none";
}

// Function to Add Product
async function addProduct() {
    const name = document.getElementById("productName").value;
    const price = document.getElementById("productPrice").value;
    const category = document.getElementById("productCategory").value;
    const stock = document.getElementById("productStock").value;
    const token = localStorage.getItem("token"); // Get stored token

    if (!name || !price || !category || !stock) {
        alert("❌ Please fill in all fields.");
        return;
    }

    if (!token) {
        alert("❌ Unauthorized! Please log in as an admin.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/products", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`, // Send token
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, price, category, stock })
        });

        const data = await response.json();
        console.log("🔹 Response:", data);

        if (response.ok) {
            alert("✅ Product added successfully!");
            closeAddProductModal();
            fetchProducts(); // Refresh product list (if applicable)
        } else {
            alert(`❌ ${data.error || "Failed to add product"}`);
        }
    } catch (error) {
        console.error("❌ Error adding product:", error);
    }
}
document.addEventListener("DOMContentLoaded", fetchProducts);

function fetchProducts() {
    fetch("http://localhost:5000/products")
        .then(response => response.json())
        .then(products => {
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
                        <button class="edit-product" onclick="openEditProductModal(${product.id}, '${product.name}', ${product.price}, '${product.category}', ${product.stock})">Edit</button>
                        <button class="delete-product" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                `;
                productList.appendChild(productCard);
            });
        })
        .catch(error => console.error("Error fetching products:", error));
}

function openAddProductModal() {
    document.getElementById("addProductModal").style.display = "flex";
}

function closeAddProductModal() {
    document.getElementById("addProductModal").style.display = "none";
}


function addProduct() {
    const name = document.getElementById("productName").value.trim();
    const price = document.getElementById("productPrice").value.trim();
    const category = document.getElementById("productCategory").value.trim();
    const stock = document.getElementById("productStock").value.trim();

    // Check if fields are empty
    if (!name || !price || !category || !stock) {
        alert("Please fill all fields before adding a product.");
        return;
    }

    // Create product object
    const newProduct = {
        name: name,
        price: parseFloat(price),
        category: category,
        stock: parseInt(stock)
    };

    // Send request to backend
    fetch("http://localhost:5000/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newProduct)
    })
    .then(response => response.json())
    .then(data => {
        alert("Product added successfully!");
        closeAddProductModal(); // Close modal after adding
        fetchProducts(); // Refresh product list
    })
    .catch(error => console.error("Error adding product:", error));
}


function updateProduct() {
    let id = document.getElementById("editProductId").value;
    let name = document.getElementById("editProductName").value;
    let price = document.getElementById("editProductPrice").value;
    let category = document.getElementById("editProductCategory").value;
    let stock = document.getElementById("editProductStock").value;

    fetch(`http://localhost:5000/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, category, stock })
    })
    .then(response => response.json())
    .then(() => {
        closeEditProductModal();
        fetchProducts();
    })
    .catch(error => console.error("Error updating product:", error));
}

