document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

async function fetchProducts() {
    const category = document.getElementById("searchCategory")?.value;
    const minPrice = document.getElementById("minPrice")?.value;
    const maxPrice = document.getElementById("maxPrice")?.value;
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    let url = "http://localhost:5000/products?";
    if (category) url += `category=${category}&`;
    if (minPrice) url += `minPrice=${minPrice}&`;
    if (maxPrice) url += `maxPrice=${maxPrice}&`;

    try {
        const response = await fetch(url);
        const products = await response.json();

        const productList = document.getElementById("productList");
        productList.innerHTML = ""; // Clear existing products

        products.forEach(product => {
            const productDiv = document.createElement("div");
            productDiv.classList.add("product-card");

            productDiv.innerHTML = `
                <h3>${product.name}</h3>
                <p>Price: $${product.price}</p>
                <p>Category: ${product.category}</p>
                <p>Stock: ${product.stock > 0 ? "Available" : "Out of Stock"}</p>
                <button onclick="viewDetails(${product.id})">View Details</button>
                ${role === "admin" || product.seller_id ? `
                    <button onclick="editProduct(${product.id})">Edit</button>
                    <button onclick="deleteProduct(${product.id})">Delete</button>
                ` : ""}
            `;

            productList.appendChild(productDiv);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// View product details (redirect to details page)
function viewDetails(productId) {
    window.location.href = `productDetails.html?id=${productId}`;
}

// Edit product (redirect to edit page)
function editProduct(productId) {
    window.location.href = `editProduct.html?id=${productId}`;
}

// Delete product
async function deleteProduct(productId) {
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const response = await fetch(`http://localhost:5000/products/${productId}`, {
            method: "DELETE",
            headers: { "Authorization": token }
        });

        const data = await response.json();
        if (response.ok) {
            alert("Product deleted successfully!");
            fetchProducts(); // Refresh products list
        } else {
            alert(data.error || "Failed to delete product");
        }
    } catch (error) {
        console.error("Error deleting product:", error);
    }
}