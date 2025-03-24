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
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    document.getElementById("addProductButton").addEventListener("click", openAddProductModal);
    document.getElementById("closeModalButton").addEventListener("click", closeAddProductModal);
});

async function fetchProducts() {
    try {
        const response = await fetch("http://localhost:5000/products");
        const products = await response.json();
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
        console.error("Error fetching products:", error);
    }
}

function openAddProductModal() {
    document.getElementById("addProductModal").style.display = "block";
}

function closeAddProductModal() {
    document.getElementById("addProductModal").style.display = "none";
}

async function addProduct() {
    const name = document.getElementById("productName").value;
    const category = document.getElementById("productCategory").value;
    const price = document.getElementById("productPrice").value;
    const stock = document.getElementById("productStock").value;
    const token = localStorage.getItem("token");

    if (!name || !category || !price || !stock) {
        alert("Please fill in all fields.");
        return;
    }
    if (!token) {
        alert("Unauthorized! Please log in.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/products", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, category, price, stock })
        });

        if (response.ok) {
            alert("Product added successfully!");
            closeAddProductModal();
            fetchProducts();
        } else {
            const data = await response.json();
            alert(`Error: ${data.error || 'Failed to add product'}`);
        }
    } catch (error) {
        console.error("Error adding product:", error);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    document.getElementById("addProductButton")?.addEventListener("click", openAddProductModal);
    document.getElementById("closeAddModal")?.addEventListener("click", closeAddProductModal);
    document.getElementById("closeEditModal")?.addEventListener("click", closeEditProductModal);
});

async function fetchProducts() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Unauthorized! Please log in.");
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/products", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error("Failed to fetch products");

        const products = await response.json();
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
                    <button class="edit-product" onclick="openEditProductModal(${product.id}, '${product.name}', '${product.category}', ${product.price}, ${product.stock})">Edit</button>
                    <button class="delete-product" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            `;
            productList.appendChild(productCard);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// Open Add Product Modal
function openAddProductModal() {
    document.getElementById("addProductModal").style.display = "block";
    document.querySelector(".modal-overlay").style.display = "block";
}

// Close Add Product Modal
function closeAddProductModal() {
    document.getElementById("addProductModal").style.display = "none";
    document.querySelector(".modal-overlay").style.display = "none";
}

// Open Edit Product Modal
function openEditProductModal(id, name, category, price, stock) {
    document.getElementById("editProductId").value = id;
    document.getElementById("editProductName").value = name;
    document.getElementById("editProductCategory").value = category;
    document.getElementById("editProductPrice").value = price;
    document.getElementById("editProductStock").value = stock;

    document.getElementById("editProductModal").style.display = "block";
    document.querySelector(".modal-overlay").style.display = "block";
}

// Close Edit Product Modal
function closeEditProductModal() {
    document.getElementById("editProductModal").style.display = "none";
    document.querySelector(".modal-overlay").style.display = "none";
}

// Update Product in Database
async function updateProduct() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Unauthorized! Please log in.");
        return;
    }

    const id = document.getElementById("editProductId").value;
    const name = document.getElementById("editProductName").value.trim();
    const category = document.getElementById("editProductCategory").value.trim();
    const price = parseFloat(document.getElementById("editProductPrice").value);
    const stock = parseInt(document.getElementById("editProductStock").value, 10);

    // Validation
    if (!name || !category || isNaN(price) || isNaN(stock)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/products/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, category, price, stock }) // Sending updated data
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Failed to update product");

        alert("Product updated successfully!");
        closeEditProductModal();
        fetchProducts(); // Refresh product list
    } catch (error) {
        console.error("Error updating product:", error);
        alert("Error updating product. Check console for details.");
    }
}
// searchbar
document.getElementById("searchButton").addEventListener("click", () => {
    document.getElementById("searchProductModal").style.display = "flex";
});

function closeSearchModal() {
    document.getElementById("searchProductModal").style.display = "none";
}
async function searchProduct() {
    const searchInput = document.getElementById("searchInput");
    const searchValue = searchInput.value.trim();

    console.log("🔍 Searching for:", searchValue); // Debug log

    if (!searchValue) {
        alert("Please enter a product name.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/products?search=${encodeURIComponent(searchValue)}`);
        const data = await response.json();

        console.log("🔍 API Response:", data); // Log API response

        if (Array.isArray(data) && data.length > 0) {
            console.log("📌 Calling displayProducts with data:", data); // Debugging log
            displayProducts(data); // Call display function
        } else {
            alert("No products found.");
        }
    } catch (error) {
        console.error("❌ Fetch Error:", error);
        alert("An error occurred while searching.");
    }
}

function displayProducts(products) {
    const container = document.getElementById("productContainer");

    if (!container) {
        console.error("❌ Error: Product container not found.");
        return;
    }

    container.innerHTML = ""; // Clear previous products

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
            <h3>${product.name}</h3>
            <p>Price: $${product.price}</p>
            <p>Category: ${product.category}</p>
            <p>Stock: ${product.stock}</p>
        `;
        container.appendChild(productCard);
    });
}



