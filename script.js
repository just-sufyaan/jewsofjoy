// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
  // Dynamic year in footer copyright
  const yearElements = document.querySelectorAll('.current-year');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(element => {
    element.textContent = currentYear;
  });
  
  // Toast Notification System
  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add appropriate icon based on type
    let icon = '';
    switch(type) {
      case 'success':
        icon = 'fa-circle-check';
        break;
      case 'error':
        icon = 'fa-circle-xmark';
        break;
      case 'info':
      default:
        icon = 'fa-circle-info';
        break;
    }
    
    // Set toast content
    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <div class="toast-message">${message}</div>
      <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Add click event for close button
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', function() {
      toast.remove();
    });
    
    // Auto-remove after animation
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }
  
  // Shopping Cart Functionality
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Update cart count on all pages
  function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
      element.textContent = getTotalItems();
      if (getTotalItems() > 0) {
        element.classList.add('show');
      } else {
        element.classList.remove('show');
      }
    });
  }
  
  // Calculate total items in cart
  function getTotalItems() {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  }
  
  // Calculate cart total price
  function calculateTotal() {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  }
  
  // Initialize cart UI
  function initCart() {
    updateCartCount();
    
    // Handle "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        const product = {
          id: productCard.dataset.id,
          name: productCard.dataset.name,
          price: parseInt(productCard.dataset.price),
          image: productCard.dataset.image,
          quantity: 1
        };
        
        addToCart(product);
        
        // Show toast notification instead of alert
        showToast(`${product.name} added to cart!`, 'success');
      });
    });
    
    // If we're on the cart page, display cart items
    if (window.location.href.includes('cart.html')) {
      displayCartItems();
      
      // Set up clear cart button with confirmation
      const clearCartButton = document.getElementById('clear-cart');
      const confirmationOverlay = document.getElementById('confirmation-overlay');
      const confirmYesButton = document.getElementById('confirm-yes');
      const confirmNoButton = document.getElementById('confirm-no');
      
      if (clearCartButton && confirmationOverlay) {
        clearCartButton.addEventListener('click', function() {
          // Show confirmation dialog instead of immediately clearing
          confirmationOverlay.style.display = 'flex';
        });
        
        // Handle confirmation dialog responses
        if (confirmYesButton) {
          confirmYesButton.addEventListener('click', function() {
            clearCart();
            confirmationOverlay.style.display = 'none';
            showToast('Your cart has been cleared', 'info');
          });
        }
        
        if (confirmNoButton) {
          confirmNoButton.addEventListener('click', function() {
            confirmationOverlay.style.display = 'none';
          });
        }
      }
      
      // Set up checkout button
      const checkoutButton = document.getElementById('checkout-button');
      if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
          // Show toast notification instead of alert
          showToast('Thank you for your purchase! Processing your order...', 'success');
          
          // Simulate checkout process with a delay
          setTimeout(() => {
            clearCart();
            showToast('Your order has been placed successfully!', 'success');
          }, 2000);
        });
      }
    }
  }
  
  // Add item to cart
  function addToCart(product) {
    // Check if item already exists in cart
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cartItems.push(product);
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update UI
    updateCartCount();
  }
  
  // Remove item from cart
  function removeFromCart(productId) {
    const index = cartItems.findIndex(item => item.id === productId);
    if (index !== -1) {
      const removedItem = cartItems[index];
      cartItems.splice(index, 1);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // Update UI
      updateCartCount();
      displayCartItems();
      
      // Show toast notification
      showToast(`${removedItem.name} removed from cart`, 'info');
    }
  }
  
  // Update item quantity
  function updateItemQuantity(productId, change) {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, (item.quantity || 1) + change);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // Update UI
      updateCartCount();
      displayCartItems();
    }
  }
  
  // Clear all items from cart
  function clearCart() {
    cartItems.length = 0;
    localStorage.removeItem('cart');
    updateCartCount();
    displayCartItems();
  }
  
  // Display cart items on cart page
  function displayCartItems() {
    const cartContainer = document.getElementById('cart-container');
    const cartEmptyMessage = document.getElementById('cart-empty-message');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartContainer) return;
    
    cartContainer.innerHTML = '';
    
    if (cartItems.length === 0) {
      // Show empty cart message
      if (cartEmptyMessage) cartEmptyMessage.style.display = 'block';
      if (cartSummary) cartSummary.classList.remove('show');
      return;
    }
    
    // Hide empty cart message and show summary
    if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';
    if (cartSummary) cartSummary.classList.add('show');
    
    // Create cart item elements
    cartItems.forEach(item => {
      const cartItemElement = document.createElement('div');
      cartItemElement.className = 'cart-item';
      
      cartItemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">R${item.price}</div>
          <div class="cart-item-quantity">
            <button class="decrease-quantity" data-id="${item.id}">-</button>
            <span>${item.quantity || 1}</span>
            <button class="increase-quantity" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      
      cartContainer.appendChild(cartItemElement);
    });
    
    // Update total amount
    const totalElement = document.getElementById('cart-total-amount');
    if (totalElement) {
      totalElement.textContent = calculateTotal();
    }
    
    // Add event listeners to quantity buttons
    const decreaseButtons = document.querySelectorAll('.decrease-quantity');
    const increaseButtons = document.querySelectorAll('.increase-quantity');
    const removeButtons = document.querySelectorAll('.cart-item-remove');
    
    decreaseButtons.forEach(button => {
      button.addEventListener('click', function() {
        updateItemQuantity(this.dataset.id, -1);
      });
    });
    
    increaseButtons.forEach(button => {
      button.addEventListener('click', function() {
        updateItemQuantity(this.dataset.id, 1);
      });
    });
    
    removeButtons.forEach(button => {
      button.addEventListener('click', function() {
        removeFromCart(this.dataset.id);
      });
    });
  }
  
  // Initialize cart functionality
  initCart();
  
  // Newsletter form submission
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent actual form submission
      
      // Get form values
      const email = document.getElementById('newsletter-email').value;
      const consent = document.getElementById('newsletter-consent').checked;
      
      // Basic validation
      if (email && consent) {
        // Show success message
        document.getElementById('newsletter-success').style.display = 'block';
        
        // Clear form
        newsletterForm.reset();
        
        // In a real implementation, you would send this data to your server here
        console.log('Newsletter signup:', { email, consent });
      }
    });
  }
  
  // Contact form validation
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const subjectSelect = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const subjectError = document.getElementById('subjectError');
    const messageError = document.getElementById('messageError');
    
    // Clear default value when input is focused
    function clearDefaultValue(input) {
      if (input.value === 'Your Name' || 
          input.value === 'Your Email' || 
          input.value === 'Your Phone Number' || 
          input.value === 'Your Message') {
        input.value = '';
      }
    }
    
    // Add focus event listeners to clear default values
    if (nameInput) nameInput.addEventListener('focus', function() { clearDefaultValue(this); });
    if (emailInput) emailInput.addEventListener('focus', function() { clearDefaultValue(this); });
    if (phoneInput) phoneInput.addEventListener('focus', function() { clearDefaultValue(this); });
    if (messageInput) messageInput.addEventListener('focus', function() { clearDefaultValue(this); });
    
    // Form submission validation
    contactForm.addEventListener('submit', function(event) {
      let isValid = true;
      
      // Reset error messages
      if (nameError) nameError.textContent = '';
      if (emailError) emailError.textContent = '';
      if (subjectError) subjectError.textContent = '';
      if (messageError) messageError.textContent = '';
      
      // Validate name
      if (nameInput && (nameInput.value === '' || nameInput.value === 'Your Name')) {
        nameError.textContent = 'Please enter your name';
        isValid = false;
        event.preventDefault();
      }
      
      // Validate email
      if (emailInput && (emailInput.value === '' || emailInput.value === 'Your Email')) {
        emailError.textContent = 'Please enter your email address';
        isValid = false;
        event.preventDefault();
      } else if (emailInput) {
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
          emailError.textContent = 'Please enter a valid email address';
          isValid = false;
          event.preventDefault();
        }
      }
      
      // Validate subject (optional but recommended)
      if (subjectSelect && (subjectSelect.value === '' || subjectSelect.selectedIndex === 0)) {
        subjectError.textContent = 'Please select a subject';
        isValid = false;
        event.preventDefault();
      }
      
      // Validate message
      if (messageInput && (messageInput.value === '' || messageInput.value === 'Your Message')) {
        messageError.textContent = 'Please enter your message';
        isValid = false;
        event.preventDefault();
      }
      
      // If form is valid, alert user (in a real scenario, this would submit)
      if (isValid) {
        alert('Thank you for your message! We will get back to you soon.');
        // Form will submit naturally after this alert
      }
    });
  }
  
  // Gallery functionality using jQuery (if available)
  if (typeof jQuery !== 'undefined' && typeof jQuery.fn.simpleLightbox !== 'undefined') {
    $(document).ready(function() {
      // Initialize lightbox for gallery
      var gallery = $('.gallery-link').simpleLightbox({
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        closeText: '<i class="fa fa-times"></i>',
        loadingText: 'Loading...',
        animationSlide: true,
        animationSpeed: 250
      });
    });
  }
}); 

function updateDateTime() {
  const now = new Date();
  
  // Update time
  const timeElement = document.getElementById('current-time');
  if (timeElement) {
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
  }
  
  // Update date
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
  }
}

// Update date and time every second
setInterval(updateDateTime, 1000);
updateDateTime(); // Initial call
