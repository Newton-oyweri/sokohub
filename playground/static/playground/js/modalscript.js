document.getElementById("submit-order").addEventListener("click", function () {

    const product = document.getElementById("confirm-product").innerText;
    const quantity = document.getElementById("confirm-quantity").innerText;
    const location = document.getElementById("confirm-location").innerText;

    fetch("/place-order/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            product_name: product,
            quantity: quantity,
            location: location
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "ok") {
            // Redirect to cart page after saving the order
            window.location.href = "/cart/";   // <-- replace with your cart URL
        } else {
            alert("Error: " + data.error);
        }
    });
});

// CSRF helper function
function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

