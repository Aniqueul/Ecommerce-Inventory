document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    // Redirect to login if no token is found
    if (!token) {
        window.location.href = '/';
        return;
    }

    try {
        // Fetch products from the backend
        const response = await fetch('http://localhost:5000/products', {
            headers: { 'Authorization': token }
        });

        const products = await response.json();

        if (response.ok) {
            // Display products
            const productList = document.getElementById('productList');
            productList.innerHTML = products.map(product => `
                <div class="product">
                    <h3>${product.name}</h3>
                    <p>Price: $${product.price}</p>
                    <p>Category: ${product.category}</p>
                    <p>Stock: ${product.stock}</p>
                </div>
            `).join('');
        } else {
            console.error('Failed to fetch products:', products.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }

    // Logout button
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/';
    });
});