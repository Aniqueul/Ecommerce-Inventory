// Register Form
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    try {
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            alert('User registered successfully!');
            window.location.href = '/'; // Redirect to login page
        } else {
            document.getElementById('errorMessage').textContent = data.error || 'Registration failed';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('errorMessage').textContent = 'An error occurred. Please try again.';
    }
});

// Login Form
document.addEventListener("DOMContentLoaded", function () {
    const registerButton = document.querySelector(".button2"); // Select the register button

    if (registerButton) {
        registerButton.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent any default behavior (if inside a form)
            window.location.href = "register.html"; // Redirect to register page
        });
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.querySelector(".button1");

    if (loginButton) {
        loginButton.addEventListener("click", async function (event) {
            event.preventDefault();

            const username = document.querySelector(".input-field[type='text']").value.trim();
            const password = document.querySelector(".input-field[type='password']").value.trim();

            if (!username || !password) {
                alert("Please enter both username and password.");
                return;
            }

            try {
                const response = await fetch("http://localhost:5000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Store token in localStorage for future requests
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("role", data.role); // Store user role if needed
                    window.location.href = "products.html"; // Redirect to products page
                } else {
                    alert(data.error); // Show error message
                }
            } catch (error) {
                console.error("Login error:", error);
                alert("An error occurred. Please try again.");
            }
        });
    }
});
