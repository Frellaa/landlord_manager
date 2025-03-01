// script.js
document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const navLinks = document.querySelectorAll('nav ul li a');

    // Simple data storage using localStorage
    const storage = {
        houses: JSON.parse(localStorage.getItem('houses')) || [],
        tenants: JSON.parse(localStorage.getItem('tenants')) || [],
        utilities: JSON.parse(localStorage.getItem('utilities')) || [],
        invoices: JSON.parse(localStorage.getItem('invoices')) || [],
    };

    function saveData() {
        localStorage.setItem('houses', JSON.stringify(storage.houses));
        localStorage.setItem('tenants', JSON.stringify(storage.tenants));
        localStorage.setItem('utilities', JSON.stringify(storage.utilities));
        localStorage.setItem('invoices', JSON.stringify(storage.invoices));
    }

    function showSection(section) {
        let html = '';
        switch (section) {
            case 'houses':
                html = `
                    <h2 class="text-2xl mb-4">Houses</h2>
                    <ul id="housesList" class="list-disc pl-5">
                        ${storage.houses.map(h => `<li>${h.address} - ${h.rooms || 0} rooms</li>`).join('')}
                    </ul>
                    <form id="addHouse" class="mt-4">
                        <div class="form-group">
                            <label class="block mb-1">Address:</label>
                            <input type="text" id="houseAddress" class="input-field" required>
                        </div>
                        <div class="form-group">
                            <label class="block mb-1">Rooms:</label>
                            <input type="number" id="houseRooms" class="input-field" required>
                        </div>
                        <button type="submit" class="button">Add House</button>
                    </form>
                `;
                break;
            case 'tenants':
                html = `
                    <h2 class="text-2xl mb-4">Tenants</h2>
                    <ul id="tenantsList" class="list-disc pl-5">
                        ${storage.tenants.map(t => `<li>${t.name} - Rent: ${t.rent || 0}€</li>`).join('')}
                    </ul>
                    <form id="addTenant" class="mt-4">
                        <div class="form-group">
                            <label class="block mb-1">Name:</label>
                            <input type="text" id="tenantName" class="input-field" required>
                        </div>
                        <div class="form-group">
                            <label class="block mb-1">Rent (€):</label>
                            <input type="number" id="tenantRent" class="input-field" required>
                        </div>
                        <button type="submit" class="button">Add Tenant</button>
                    </form>
                `;
                break;
            case 'utilities':
                html = `
                    <h2 class="text-2xl mb-4">Utilities</h2>
                    <ul id="utilitiesList" class="list-disc pl-5">
                        ${storage.utilities.map(u => `<li>${u.type} - ${u.amount || 0}€</li>`).join('')}
                    </ul>
                    <form id="addUtility" class="mt-4">
                        <div class="form-group">
                            <label class="block mb-1">Type:</label>
                            <input type="text" id="utilityType" class="input-field" required>
                        </div>
                        <div class="form-group">
                            <label class="block mb-1">Amount (€):</label>
                            <input type="number" id="utilityAmount" class="input-field" required>
                        </div>
                        <button type="submit" class="button">Add Utility</button>
                    </form>
                `;
                break;
            case 'invoices':
                html = `
                    <h2 class="text-2xl mb-4">Invoices</h2>
                    <ul id="invoicesList" class="list-disc pl-5">
                        ${storage.invoices.map(i => `<li>${i.type} - ${i.amount || 0}€ - Paid: ${i.paid ? 'Yes' : 'No'}</li>`).join('')}
                    </ul>
                    <form id="addInvoice" class="mt-4">
                        <div class="form-group">
                            <label class="block mb-1">Type (Rent/Utility):</label>
                            <input type="text" id="invoiceType" class="input-field" required>
                        </div>
                        <div class="form-group">
                            <label class="block mb-1">Amount (€):</label>
                            <input type="number" id="invoiceAmount" class="input-field" required>
                        </div>
                        <div class="form-group">
                            <label class="block mb-1">Paid (yes/no):</label>
                            <input type="text" id="invoicePaid" class="input-field" placeholder="yes/no" required>
                        </div>
                        <button type="submit" class="button">Add Invoice</button>
                    </form>
                `;
                break;
        }
        content.innerHTML = html;

        // Add form submission handlers
        if (section === 'houses') {
            document.getElementById('addHouse').addEventListener('submit', (e) => {
                e.preventDefault();
                const address = document.getElementById('houseAddress').value;
                const rooms = document.getElementById('houseRooms').value;
                storage.houses.push({ address, rooms: parseInt(rooms) });
                saveData();
                showSection('houses');
            });
        } else if (section === 'tenants') {
            document.getElementById('addTenant').addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('tenantName').value;
                const rent = document.getElementById('tenantRent').value;
                storage.tenants.push({ name, rent: parseFloat(rent) });
                saveData();
                showSection('tenants');
            });
        } else if (section === 'utilities') {
            document.getElementById('addUtility').addEventListener('submit', (e) => {
                e.preventDefault();
                const type = document.getElementById('utilityType').value;
                const amount = document.getElementById('utilityAmount').value;
                storage.utilities.push({ type, amount: parseFloat(amount) });
                saveData();
                showSection('utilities');
            });
        } else if (section === 'invoices') {
            document.getElementById('addInvoice').addEventListener('submit', (e) => {
                e.preventDefault();
                const type = document.getElementById('invoiceType').value;
                const amount = document.getElementById('invoiceAmount').value;
                const paid = document.getElementById('invoicePaid').value.toLowerCase() === 'yes';
                storage.invoices.push({ type, amount: parseFloat(amount), paid });
                saveData();
                showSection('invoices');
            });
        }
    }

    // Set initial section and navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substring(1);
            showSection(section);
        });
    });

    // Show default section (Houses)
    showSection('houses');
});