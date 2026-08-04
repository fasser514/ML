// ==================== تهيئة البيانات ====================
let categories = JSON.parse(localStorage.getItem('mlCategories')) || [
    { id: 1, name: 'إيربودز', icon: 'fa-headphones' },
    { id: 2, name: 'ساعات ذكية', icon: 'fa-clock' }
];

let products = JSON.parse(localStorage.getItem('mlProducts')) || [
    { id: 1, categoryId: 1, name: 'AirPods Pro 2', price: 5500, image: '', description: 'سماعات لاسلكية مع عزل متطور للضوضاء' },
    { id: 2, categoryId: 2, name: 'Apple Watch Ultra 2', price: 18500, image: '', description: 'أداء استثنائي مع شاشة ساطعة' }
];

let cart = JSON.parse(localStorage.getItem('mlCart')) || [];
let orders = JSON.parse(localStorage.getItem('mlOrders')) || [];

// ==================== أسعار الشحن لكل محافظة ====================
const shippingPrices = {
    'القاهرة': 50,
    'الجيزة': 55,
    'الإسكندرية': 60,
    'البحيرة': 65,
    'كفر الشيخ': 65,
    'الدقهلية': 60,
    'الشرقية': 55,
    'الغربية': 65,
    'المنوفية': 55,
    'القليوبية': 50,
    'الفيوم': 70,
    'بني سويف': 75,
    'المنيا': 80,
    'أسيوط': 85,
    'سوهاج': 90,
    'قنا': 95,
    'الأقصر': 100,
    'أسوان': 110,
    'البحر الأحمر': 100,
    'الوادي الجديد': 120,
    'مطروح': 100,
    'شمال سيناء': 120,
    'جنوب سيناء': 120,
    'بورسعيد': 70,
    'الإسماعيلية': 65,
    'السويس': 65,
    'دمياط': 70
};

let selectedShipping = 0;
let selectedGovernorate = '';

const WHATSAPP_NUMBER = '201234567890'; // غير هذا برقمك

// ==================== حفظ البيانات ====================
function saveData() {
    localStorage.setItem('mlCategories', JSON.stringify(categories));
    localStorage.setItem('mlProducts', JSON.stringify(products));
    localStorage.setItem('mlCart', JSON.stringify(cart));
    localStorage.setItem('mlOrders', JSON.stringify(orders));
}

// ==================== التنقل ====================
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    switch(section) {
        case 'cart':
            document.getElementById('cart-section').classList.add('active');
            renderCart();
            break;
        default:
            document.getElementById('categories-section').classList.add('active');
            renderCategories();
    }
}

function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

// ==================== عرض الأقسام ====================
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = categories.map(cat => `
        <div class="category-card" onclick="showProducts(${cat.id}, '${cat.name}')">
            <i class="fas ${cat.icon}"></i>
            <h3>${cat.name}</h3>
        </div>
    `).join('');
}

// ==================== عرض المنتجات ====================
function showProducts(categoryId, categoryName) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('products-section').classList.add('active');
    document.getElementById('categoryTitle').textContent = categoryName;
    
    const filteredProducts = products.filter(p => p.categoryId === categoryId);
    const grid = document.getElementById('productsGrid');
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `<div style="text-align: center; padding: 60px; grid-column: 1/-1;"><i class="fas fa-box-open product-placeholder"></i><p style="font-size: 18px; color: #666;">لا توجد منتجات</p></div>`;
        return;
    }
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image-container">
                ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<i class="fas fa-box product-placeholder"></i>'}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
                <p class="product-price">${product.price.toLocaleString()} ج.م</p>
                <button class="btn-add-cart" onclick="addToCart(${product.id})"><i class="fas fa-cart-plus"></i> أضف للسلة</button>
            </div>
        </div>
    `).join('');
}

// ==================== إدارة السلة ====================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ productId: product.id, name: product.name, price: product.price, quantity: 1 });
    }
    
    saveData();
    updateCartCount();
    showToast('✅ تم إضافة المنتج إلى السلة');
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.getElementById('cartCount');
    countElement.textContent = count;
    countElement.style.display = count > 0 ? 'inline-block' : 'none';
}

function renderCart() {
    const container = document.getElementById('cartContainer');
    const summary = document.getElementById('cartSummary');
    const shippingSection = document.getElementById('shippingSection');
    
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>السلة فارغة</p></div>`;
        summary.style.display = 'none';
        shippingSection.style.display = 'none';
        return;
    }
    
    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-image"><i class="fas fa-box"></i></div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${item.price.toLocaleString()} ج.م</p>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">−</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <button class="btn-remove" onclick="removeFromCart(${index})"><i class="fas fa-trash-alt"></i></button>
        </div>
    `).join('');
    
    shippingSection.style.display = 'block';
    updateShipping();
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    saveData();
    updateCartCount();
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveData();
    updateCartCount();
    renderCart();
    showToast('🗑️ تم حذف المنتج من السلة');
}

// ==================== الشحن ====================
function updateShipping() {
    const governorate = document.getElementById('governorateSelect').value;
    const summary = document.getElementById('cartSummary');
    const shippingSection = document.getElementById('shippingSection');
    
    if (cart.length === 0) {
        summary.style.display = 'none';
        shippingSection.style.display = 'none';
        return;
    }
    
    shippingSection.style.display = 'block';
    summary.style.display = 'block';
    
    // لو المحافظة لسه متختارتش، استخدم القيمة 0
    if (governorate === '') {
        selectedShipping = 0;
        selectedGovernorate = '';
    } else {
        // جيب اسم المحافظة من القائمة
        const select = document.getElementById('governorateSelect');
        selectedGovernorate = select.options[select.selectedIndex].text;
        selectedShipping = shippingPrices[selectedGovernorate] || 0;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + selectedShipping;
    
    document.getElementById('subtotal').textContent = `${subtotal.toLocaleString()} ج.م`;
    document.getElementById('shippingCost').textContent = governorate ? `${selectedShipping} ج.م` : 'اختر المحافظة';
    document.getElementById('total').textContent = governorate ? `${total.toLocaleString()} ج.م` : `${subtotal.toLocaleString()} ج.م`;
}

// ==================== تأكيد الطلب ====================
function confirmOrder() {
    if (cart.length === 0) {
        showToast('⚠️ السلة فارغة');
        return;
    }
    
    if (!selectedGovernorate) {
        showToast('⚠️ الرجاء اختيار المحافظة للشحن');
        return;
    }
    
    const modal = document.getElementById('confirmModal');
    const details = document.getElementById('modalOrderDetails');
    
    let html = '';
    cart.forEach(item => {
        html += `<div class="order-item"><span>${item.name} × ${item.quantity}</span><span>${(item.price * item.quantity).toLocaleString()} ج.م</span></div>`;
    });
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + selectedShipping;
    
    html += `<div class="order-item"><span>الشحن - ${selectedGovernorate}</span><span>${selectedShipping} ج.م</span></div>`;
    html += `<div class="order-item" style="font-weight: 700; font-size: 18px; color: #c9a96e;"><span>الإجمالي</span><span>${total.toLocaleString()} ج.م</span></div>`;
    
    details.innerHTML = html;
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('confirmModal').classList.remove('active');
}

function sendToWhatsApp() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + selectedShipping;
    
    // ============== رسالة الواتساب - إنجليزي ==============
    let message = '🛍️ *New Order - M&L*\n\n';
    message += '*Items:*\n';
    
    cart.forEach((item) => {
        message += `• ${item.name} x${item.quantity}\n`;
    });
    
    message += '\n';
    message += `*Governorate:* ${selectedGovernorate}\n`;
    message += `*Shipping:* ${selectedShipping} EGP\n`;
    message += `*Total:* ${total.toLocaleString()} EGP\n`;
    message += `*Date:* ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}\n`;
    message += `*Time:* ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n\n`;
    message += 'Thank you! 🙏';
    // ============== نهاية الرسالة ==============
    
    // حفظ الطلب
    const order = {
        id: Date.now(),
        items: [...cart],
        subtotal: subtotal,
        shipping: selectedShipping,
        governorate: selectedGovernorate,
        total: total,
        status: 'confirmed',
        date: new Date().toISOString()
    };
    
    orders.unshift(order);
    cart = [];
    selectedShipping = 0;
    selectedGovernorate = '';
    
    saveData();
    updateCartCount();
    closeModal();
    showSection('categories');
    
    // إعادة تعيين حقل المحافظة
    document.getElementById('governorateSelect').value = '';
    
    // فتح واتساب
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    showToast('✅ Order sent to WhatsApp');
}

// ==================== Toast ====================
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==================== بدء التشغيل ====================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    renderCategories();
    updateCartCount();
    document.getElementById('categories-section').classList.add('active');
});