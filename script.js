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
            case 'settings':
                html = `
                    <h2 class="text-2xl mb-4">Settings</h2>
                    <form id="addHouse" class="mt-4">
                        <div class="form-group">
                            <label class="block mb-1">House Address:</label>
                            <input type="text" id="houseAddress" class="input-field" required>
                        </div>
                        <div class="form-group">
                            <label class="block mb-1">Number of Rooms:</label>
                            <input type="number" id="houseRooms" class="input-field" required>
                        </div>
                        <button type="submit" class="button">Add House</button>
                    </form>
                    <h3 class="text-xl mt-6 mb-2">Existing Houses</h3>
                    <ul id="housesList" class="list-disc pl-5">
                        ${storage.houses.map(h => `
                            <li>${h.address} - ${h.rooms.length} rooms
                                <button class="ml-2 text-red-500 hover:text-red-700" onclick="removeHouse('${h.address}')">Remove</button>
                                <ul class="list-disc pl-5">
                                    ${h.rooms.map(r => `<li>Room ${r.number} (Capacity: ${r.capacity}, Occupants: ${r.occupants.length})</li>`).join('')}
                                </ul>
                                <form class="mt-2" id="addRoom-${h.address}">
                                    <div class="form-group">
                                        <label class="block mb-1">Room Number:</label>
                                        <input type="text" class="input-field" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="block mb-1">Capacity:</label>
                                        <input type="number" class="input-field" required>
                                    </div>
                                    <button type="submit" class="button">Add Room</button>
                                </form>
                            </li>`).join('')}
                    </ul>
                `;
                break;
            case 'tenants':
                html = `
                    <h2 class="text-2xl mb-4">Tenants</h2>
                    <ul id="tenantsList" class="list-disc pl-5">
                        ${storage.tenants.map(t => `<li>${t.name} - Stay: ${t.startDate} to ${t.endDate || 'Ongoing'} - House: ${t.house}, Room: ${t.room}, Roommates: ${t.roommates?.join(', ') || 'None'}</li>`).join('')}
                    </ul>
                    <form id="addTenant" class="mt-4">
                        <div class="form-group">
                            <label class="block mb-1">Name:</label>
                            <input type="text" id="tenantName" class="input-field" required>
                        </div>
                        <div class="form-group">
                            <label class="block mb-1">Start Date:</label>
                            <input type="text" id="tenantStartDate" class="input-field calendar" placeholder="YYYY-MM-DD" required>
                        </div>
                        <div class="form-group">
                            <label class="block mb-1">End Date (optional):</label>
                            <input type="text" id="tenantEndDate" class="input-field calendar" placeholder="YYYY-MM-DD">
                        </div>
                        <div class="form-group">
                            <label class="block mb-1">House:</label>
                            <select id="tenantHouse" class="input-field" required>
                                <option value="">Select House</option>
                                ${storage.houses.map(h => `<option value="${h.address}">${h.address}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="block mb-1">Room:</label>
                            <select id="tenantRoom" class="input-field" required>
                                <option value="">Select Room</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="block mb-1">Roommates (comma-separated names):</label>
                            <input type="text" id="tenantRoommates" class="input-field">
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
            case 'overview':
                html = `
                    <h2 class="text-2xl mb-4">Room Availability Overview</h2>
                    <div id="calendar" class="calendar"></div>
                `;
                break;
        }
        content.innerHTML = html;

        // Initialize date pickers for Tenants
        if (section === 'tenants') {
            flatpickr('#tenantStartDate', { dateFormat: 'Y-m-d' });
            flatpickr('#tenantEndDate', { dateFormat: 'Y-m-d', allowInput: true });
            
            // Update room options based on selected house
            const houseSelect = document.getElementById('tenantHouse');
            const roomSelect = document.getElementById('tenantRoom');
            houseSelect.addEventListener('change', () => {
                const house = storage.houses.find(h => h.address === houseSelect.value);
                roomSelect.innerHTML = '<option value="">Select Room</option>';
                if (house) {
                    house.rooms.forEach(room => {
                        const option = document.createElement('option');
                        option.value = room.number;
                        option.text = `Room ${room.number} (Capacity: ${room.capacity}, Occupants: ${room.occupants.length})`;
                        roomSelect.appendChild(option);
                    });
                }
            });
        }

        // Initialize calendar for Overview
        if (section === 'overview') {
            const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
                initialView: 'dayGridMonth',
                events: generateCalendarEvents(),
                eventContent: function(info) {
                    return { html: `<i>${info.event.title}</i>` };
                }
            });
            calendar.render();
        }

        // Add form submission handlers (already handled in the switch case above)
    }

    // Function to remove a house
    window.removeHouse = function(address) {
        storage.houses = storage.houses.filter(h => h.address !== address);
        storage.tenants = storage.tenants.filter(t => t.house !== address);
        saveData();
        showSection('settings');
    };

    // Function to add a room to a house
    storage.houses.forEach(house => {
        const formId = `addRoom-${house.address}`;
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const roomNumber = form.querySelector('input[type="text"]').value;
                const capacity = parseInt(form.querySelector('input[type="number"]').value);
                const house = storage.houses.find(h => h.address === house.address);
                if (house) {
                    house.rooms.push({ number: roomNumber, capacity, occupants: [] });
                    saveData();
                    showSection('settings');
                }
            });
        }
    });

    // Function to generate calendar events for room availability
    function generateCalendarEvents() {
        const events = [];
        storage.houses.forEach(house => {
            house.rooms.forEach(room => {
                storage.tenants.forEach(tenant => {
                    if (tenant.house === house.address && tenant.room === room.number) {
                        events.push({
                            title: `${tenant.name} in Room ${room.number}`,
                            start: tenant.startDate,
                            end: tenant.endDate || null
                        });
                    }
                });
            });
        });
        return events;
    }

    // Set initial section and navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substring(1);
            showSection(section);
        });
    });

    // Show default section (Settings)
    showSection('settings');
});