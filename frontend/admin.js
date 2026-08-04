// Load data from localStorage
let categories = JSON.parse(localStorage.getItem('mlCategories')) || [];
let products = JSON.parse(localStorage.getItem('mlProducts')) || [];
let orders = JSON.parse(localStorage.getItem('mlOrders')) || [];

// Save data
function saveData() {
    localStorage.setItem('mlCategories', JSON.stringify(categories));
    localStorage.setItem('mlProducts', JSON.stringify(products));
    localStorage.setItem('mlOrders', JSON.stringify(orders));
}

// Navigation
function showAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    
    document.getElementById(`admin-${section}`).classList.add('active');
    document.getElementById(`nav-${section}`).classList.add('active');
    
    switch(section) {
        case 'categories':
            renderCategoriesTable();
            break;
        case 'products':
            renderProductsTable();
            loadCategoriesDropdown();
            break;
        case 'orders':
            renderOrdersTable();
            break;
    }
}

// Categories Management
function renderCategoriesTable() {
    const tbody = document.getElementById('categoriesTableBody');
    tbody.innerHTML = categories.map((cat, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><i class="fas ${cat.icon}"></i></td>
            <td>${cat.name}</td>
            <td>${products.filter(p => p.categoryId === cat.id).length}</td>
            <td>
                <button class="btn-edit" onclick="editCategory(${cat.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger" onclick="deleteCategory(${cat.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function showCategoryForm(categoryId = null) {
    const form = document.getElementById('categoryForm');
    const title = document.getElementById('categoryFormTitle');
    
    form.style.display = 'block';
    
    if (categoryId) {
        const category = categories.find(c => c.id === categoryId);
        title.textContent = 'تعديل القسم';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryIcon').value = category.icon;
    } else {
        title.textContent = 'إضافة قسم جديد';
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryFormElement').reset();
    }
}

function hideCategoryForm() {
    document.getElementById('categoryForm').style.display = 'none';
}

document.getElementById('categoryFormElement').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value;
    const icon = document.getElementById('categoryIcon').value;
    
    if (id) {
        const index = categories.findIndex(c => c.id === parseInt(id));
        categories[index].name = name;
        categories[index].icon = icon;
    } else {
        categories.push({
            id: Date.now(),
            name: name,
            icon: icon
        });
    }
    
    saveData();
    hideCategoryForm();
    renderCategoriesTable();
    showToast('تم حفظ القسم بنجاح');
});

function editCategory(id) {
    showCategoryForm(id);
}

function deleteCategory(id) {
    if (confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع المنتجات المرتبطة به.')) {
        categories = categories.filter(c => c.id !== id);
        products = products.filter(p => p.categoryId !== id);
        saveData();
        renderCategoriesTable();
        showToast('تم حذف القسم');
    }
}

// Products Management
function loadCategoriesDropdown() {
    const select = document.getElementById('productCategory');
    select.innerHTML = '<option value="">اختر القسم</option>' +
        categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = products.map((product, index) => {
        const category = categories.find(c => c.id === product.categoryId);
        return `
            <tr>
                <td>${index + 1}</td>
                <td>
                    ${product.image ? 
                        `<img src="${product.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` :
                        '<i class="fas fa-box"></i>'
                    }
                </td>
                <td>${product.name}</td>
                <td>${category ? category.name : 'غير محدد'}</td>
                <td>${product.price.toLocaleString()} ج.م</td>
                <td>
                    <button class="btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function showProductForm(productId = null) {
    const form = document.getElementById('productForm');
    const title = document.getElementById('productFormTitle');
    
    loadCategoriesDropdown();
    form.style.display = 'block';
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        title.textContent = 'تعديل المنتج';
        document.getElementById('productId').value = product.id;
        document.getElementById('productCategory').value = product.categoryId;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productImage').value = product.image || '';
    } else {
        title.textContent = 'إضافة منتج جديد';
        document.getElementById('productId').value = '';
        document.getElementById('productFormElement').reset();
    }
}

function hideProductForm() {
    document.getElementById('productForm').style.display = 'none';
}

document.getElementById('productFormElement').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const categoryId = parseInt(document.getElementById('productCategory').value);
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value;
    const image = document.getElementById('productImage').value;
    
    if (id) {
        const index = products.findIndex(p => p.id === parseInt(id));
        products[index] = { ...products[index], categoryId, name, price, description, image };
    } else {
        products.push({
            id: Date.now(),
            categoryId,
            name,
            price,
            description,
            image
        });
    }
    
    saveData();
    hideProductForm();
    renderProductsTable();
    showToast('تم حفظ المنتج بنجاح');
});

function editProduct(id) {
    showProductForm(id);
}

function deleteProduct(id) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        products = products.filter(p => p.id !== id);
        saveData();
        renderProductsTable();
        showToast('تم حذف المنتج');
    }
}

// Orders Management
function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id.toString().slice(-6)}</td>
            <td>${new Date(order.date).toLocaleDateString('ar-EG')}</td>
            <td>${order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}</td>
            <td>${order.total.toLocaleString()} ج.م</td>
            <td><span class="status-badge status-${order.status}">
                ${order.status === 'confirmed' ? 'مؤكد' : 'قيد الانتظار'}
            </span></td>
        </tr>
    `).join('');
}

// Toast
function showToast(message) {
    const toast = document.getElementById('adminToast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCategoriesTable();
});