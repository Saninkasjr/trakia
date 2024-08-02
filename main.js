const form = document.getElementById('product-form');
const productSelect = document.getElementById('product-select');
const sizeSelect = document.getElementById('size-select');
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');
const table = document.getElementById('product-table').getElementsByTagName('tbody')[0];
const exportTxtBtn = document.getElementById('export-txt-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const themeToggle = document.getElementById('theme-toggle');
let products = [];

// Retrieve products from localStorage if available
if (localStorage.getItem('products')) {
    products = JSON.parse(localStorage.getItem('products'));
    updateTable();
}

const productData = {
    'Saca': {
        sizes: ['Small', 'Medium', 'Large'],
        prices: {'Small': 10, 'Medium': 12, 'Large': 15}
    },
    'Tote Bag': {
        sizes: ['Small', 'Medium', 'Large'],
        prices: {'Small': 10, 'Medium': 15, 'Large': 25}
    },
    'Sacka Bag': {
        sizes: ['Small', 'Medium', 'Large'],
        prices: {'Small': 30, 'Medium': 45, 'Large': 55}
    },
    'Plastic Bag': {
        sizes: ['Small', 'Medium', 'Large', 'Special'],
        prices: {'Small': 3, 'Medium': 5, 'Large': 10, 'Special': 5}
    },
    'Seal Tap': {
        sizes: ['Small', 'Medium', 'Large'],
        prices: {'Small': 15, 'Medium': 20, 'Large': 25}
    }
};

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

productSelect.addEventListener('change', updateSizeOptions);
sizeSelect.addEventListener('change', updatePrice);

function updateSizeOptions() {
    const product = productSelect.value;
    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    if (product && productData[product]) {
        productData[product].sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            sizeSelect.appendChild(option);
        });
    }
    updatePrice();
}

function updatePrice() {
    const product = productSelect.value;
    const size = sizeSelect.value;
    if (product && size && productData[product] && productData[product].prices[size]) {
        priceInput.value = productData[product].prices[size];
    } else {
        priceInput.value = '';
    }
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const product = productSelect.value;
    const size = sizeSelect.value;
    const quantity = parseInt(quantityInput.value);
    const price = parseFloat(priceInput.value);
    
    if (product && size && quantity && price) {
        addProduct(product, size, quantity, price);
        updateTable();
        form.reset();
        updateSizeOptions();
    } else {
        alert('Please fill all fields');
    }
});

function addProduct(product, size, quantity, price) {
    products.push({ product, size, quantity, price, total: quantity * price });
    localStorage.setItem('products', JSON.stringify(products));
}

function updateTable() {
    table.innerHTML = '';
    products.forEach(item => {
        const row = table.insertRow();
        row.insertCell(0).textContent = item.product;
        row.insertCell(1).textContent = item.size;
        row.insertCell(2).textContent = item.quantity;
        row.insertCell(3).textContent = `K ${item.price.toFixed(2)}`;
        row.insertCell(4).textContent = `K ${item.total.toFixed(2)}`;
    });
}

function padRight(string, length) {
    return string + ' '.repeat(Math.max(0, length - string.length));
}

function padLeft(string, length) {
    return ' '.repeat(Math.max(0, length - string.length)) + string;
}

exportTxtBtn.addEventListener('click', function() {
    let content = "Product Sales Report\n\n";
    
    let maxProductLength = Math.max("Product".length, ...products.map(item => item.product.length));
    let maxSizeLength = Math.max("Size".length, ...products.map(item => item.size.length));
    let maxQuantityLength = Math.max("Quantity".length, ...products.map(item => item.quantity.toString().length));
    let maxPriceLength = Math.max("Price (K)".length, ...products.map(item => (item.price.toFixed(2) + " K").length));
    let maxTotalLength = Math.max("Total (K)".length, ...products.map(item => (item.total.toFixed(2) + " K").length));

    content += padRight("Product", maxProductLength) + " | ";
    content += padRight("Size", maxSizeLength) + " | ";
    content += padLeft("Quantity", maxQuantityLength) + " | ";
    content += padLeft("Price (K)", maxPriceLength) + " | ";
    content += padLeft("Total (K)", maxTotalLength) + "\n";

    content += "-".repeat(maxProductLength) + "-+-";
    content += "-".repeat(maxSizeLength) + "-+-";
    content += "-".repeat(maxQuantityLength) + "-+-";
    content += "-".repeat(maxPriceLength) + "-+-";
    content += "-".repeat(maxTotalLength) + "\n";

    products.forEach(item => {
        content += padRight(item.product, maxProductLength) + " | ";
        content += padRight(item.size, maxSizeLength) + " | ";
        content += padLeft(item.quantity.toString(), maxQuantityLength) + " | ";
        content += padLeft(item.price.toFixed(2) + " K", maxPriceLength) + " | ";
        content += padLeft(item.total.toFixed(2) + " K", maxTotalLength) + "\n";
    });
    
    downloadFile(content, 'product_sales_report.txt', 'text/plain');
});

exportPdfBtn.addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Product Sales Report", 14, 15);
    
    const tableData = products.map(item => [
        item.product,
        item.size,
        item.quantity,
        `K ${item.price.toFixed(2)}`,
        `K ${item.total.toFixed(2)}`
    ]);

    doc.autoTable({
        head: [['Product', 'Size', 'Quantity', 'Price (K)', 'Total (K)']],
        body: tableData,
        startY: 20
    });

    doc.save('product_sales_report.pdf');
});

exportCsvBtn.addEventListener('click', function() {
    const csvData = Papa.unparse({
        fields: ['Product', 'Size', 'Quantity', 'Price (K)', 'Total (K)'],
        data: products.map(item => [
            item.product,
            item.size,
            item.quantity,
            item.price.toFixed(2),
            item.total.toFixed(2)
        ])
    });

    downloadFile(csvData, 'product_sales_report.csv', 'text/csv;charset=utf-8;');
});

function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}