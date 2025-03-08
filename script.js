//python -m http.server 8080
//localStorage.clear();

// Ensure this script is loaded as a module in your HTML:
// <script type="module" src="script.js"></script>

// Import Firebase modular APIs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCmJJB9BcRazKw46SRHlG4DWji2kruqRp4",
    authDomain: "landlord-8b412.firebaseapp.com",
    databaseURL: "https://landlord-8b412-default-rtdb.firebaseio.com",
    projectId: "landlord-8b412",
    storageBucket: "landlord-8b412.firebasestorage.app",
    messagingSenderId: "688578649227",
    appId: "1:688578649227:web:ddda49059a64667b13c88e",
    measurementId: "G-4TBCEREMF3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('nav ul li a');

    console.log('DOM fully loaded');

    // Check if user is logged in
    let currentUser = null;
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user.uid;
            console.log(`User logged in: ${currentUser}`);
            nav.classList.remove('hidden');
            loadUserData(currentUser).then(() => showSection('settings'));
        } else {
            console.log('No current user, showing auth');
            currentUser = null;
            showAuth();
        }
    });

    async function saveData(userId) {
        if (!userId) {
            console.error('No user ID provided for saving data');
            return;
        }
        const userData = {
            houses: storage.houses,
            tenants: storage.tenants,
            payments: storage.payments,
            invoices: storage.invoices,
        };
        try {
            await set(ref(database, `users/${userId}/data`), userData);
            console.log(`Data saved for user: ${userId}`);
        } catch (error) {
            console.error('Error saving data to Firebase:', error);
        }
    }

    async function loadUserData(userId) {
        if (!userId) {
            console.error('No user ID provided for loading data');
            return;
        }
        try {
            const snapshot = await get(ref(database, `users/${userId}/data`));
            const userData = snapshot.val() || {};
            storage.houses = userData.houses || [];
            storage.tenants = userData.tenants || [];
            storage.payments = userData.payments || [];
            storage.invoices = userData.invoices || [];
            console.log(`Data loaded for user: ${userId}`, storage);
        } catch (error) {
            console.error('Error loading data from Firebase:', error);
        }
    }

    const storage = {
        houses: [],
        tenants: [],
        payments: [],
        invoices: [],
    };

    function showSection(section) {
        if (!content) {
            console.error('Content element not found');
            return;
        }

        let html = '';
        switch (section) {
            case 'login':
                html = `
                    <h2 class="text-2xl mb-4 font-bold text-gray-800">Login</h2>
                    <form id="loginForm" class="mt-4 bg-white p-4 rounded-lg shadow-md">
                        <div class="form-group mb-4">
                            <label class="block mb-1 text-gray-700">Email:</label>
                            <input type="email" id="loginEmail" class="input-field border-gray-300 focus:border-blue-500" required>
                        </div>
                        <div class="form-group mb-4">
                            <label class="block mb-1 text-gray-700">Password:</label>
                            <input type="password" id="loginPassword" class="input-field border-gray-300 focus:border-blue-500" required>
                        </div>
                        <button type="submit" class="button mt-2">Login</button>
                        <p class="mt-2 text-gray-700">Don't have an account? <a href="#" class="text-blue-500 hover:underline" id="registerLink">Register here</a></p>
                    </form>
                `;
                break;
            case 'register':
                html = `
                    <h2 class="text-2xl mb-4 font-bold text-gray-800">Register</h2>
                    <form id="registerForm" class="mt-4 bg-white p-4 rounded-lg shadow-md">
                        <div class="form-group mb-4">
                            <label class="block mb-1 text-gray-700">Email:</label>
                            <input type="email" id="registerEmail" class="input-field border-gray-300 focus:border-blue-500" required>
                        </div>
                        <div class="form-group mb-4">
                            <label class="block mb-1 text-gray-700">Password:</label>
                            <input type="password" id="registerPassword" class="input-field border-gray-300 focus:border-blue-500" required>
                        </div>
                        <button type="submit" class="button mt-2">Register</button>
                        <p class="mt-2 text-gray-700">Already have an account? <a href="#" class="text-blue-500 hover:underline" id="loginLink">Login here</a></p>
                    </form>
                `;
                break;
            case 'settings':
                html = `
                    <h2 class="text-2xl mb-4 font-bold text-gray-800">Settings</h2>
                    <form id="addHouseForm" class="mt-4 bg-white p-4 rounded-lg shadow-md">
                        <div class="form-group mb-4">
                            <label class="block mb-1 text-gray-700">House Address:</label>
                            <input type="text" id="houseAddress" class="input-field border-gray-300 focus:border-blue-500" required>
                        </div>
                        <button type="submit" class="button">Add House</button>
                    </form>
                    <h3 class="text-xl mt-6 mb-2 font-semibold text-gray-800">Existing Houses</h3>
                    <ul id="housesList" class="list-disc pl-5 space-y-4">
                        ${(storage.houses || []).map(h => `
                            <li class="bg-white p-4 rounded-lg shadow-md">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-800">${h.address} - ${(h.rooms || []).length} rooms</span>
                                    <button class="ml-2 text-red-500 hover:text-red-700" onclick="removeHouse('${h.address}')">Remove</button>
                                </div>
                                <ul class="list-disc pl-5 mt-2 space-y-2">
                                    ${(h.rooms || []).map(r => `<li class="text-gray-700">Room ${r.number} (Capacity: ${r.capacity || 'Not set'}, Occupants: ${(r.occupants || []).length})</li>`).join('')}
                                </ul>
                                <form class="mt-4" id="addRoomForm-${h.address}">
                                    <div class="form-group mb-2">
                                        <label class="block mb-1 text-gray-700">Room Number:</label>
                                        <input type="text" class="input-field border-gray-300 focus:border-blue-500" required>
                                    </div>
                                    <div class="form-group mb-2">
                                        <label class="block mb-1 text-gray-700">Capacity:</label>
                                        <input type="number" class="input-field border-gray-300 focus:border-blue-500" required min="1">
                                    </div>
                                    <button type="submit" class="button mt-2">Add Room</button>
                                </form>
                            </li>
                        `).join('')}
                    </ul>
                `;
                break;
            case 'tenants':
                html = `
                    <h2 class="text-2xl mb-4 font-bold text-gray-800">Tenants</h2>
                    <ul id="tenantsList" class="list-disc pl-5 space-y-4">
                        ${(storage.tenants || []).map(t => `
                            <li class="bg-white p-4 rounded-lg shadow-md">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-700">${t.name} - Stay: ${t.startDate} to ${t.endDate || 'Ongoing'} - House: ${t.house}, Room: ${t.room}, Rent: ${t.rent || 0}€, Roommates: ${(t.roommates || []).join(', ') || 'None'}</span>
                                    <button class="ml-2 text-red-500 hover:text-red-700" onclick="removeTenant('${t.name}', '${t.house}', '${t.room}')">Remove</button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                    <form id="addTenantForm" class="mt-4 bg-white p-4 rounded-lg shadow-md">
                        <div class="form-group mb-2">
                            <label class="block mb-1 text-gray-700">Name:</label>
                            <input type="text" id="tenantName" class="input-field border-gray-300 focus:border-blue-500" required>
                        </div>
                        <div class="form-group mb-2">
                            <label class="block mb-1 text-gray-700">Start Date:</label>
                            <input type="text" id="tenantStartDate" class="input-field calendar" placeholder="YYYY-MM-DD" required>
                        </div>
                        <div class="form-group mb-2">
                            <label class="block mb-1 text-gray-700">End Date (optional):</label>
                            <input type="text" id="tenantEndDate" class="input-field calendar" placeholder="YYYY-MM-DD">
                        </div>
                        <div class="form-group mb-2">
                            <label class="block mb-1 text-gray-700">House:</label>
                            <select id="tenantHouse" class="input-field" required>
                                <option value="">Select House</option>
                                ${(storage.houses || []).map(h => `<option value="${h.address}">${h.address}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group mb-2">
                            <label class="block mb-1 text-gray-700">Room:</label>
                            <select id="tenantRoom" class="input-field" required>
                                <option value="">Select Room</option>
                            </select>
                        </div>
                        <div class="form-group mb-2">
                            <label class="block mb-1 text-gray-700">Monthly Rent (€):</label>
                            <input type="number" id="tenantRent" class="input-field border-gray-300 focus:border-blue-500" required min="0" step="0.01">
                        </div>
                        <div class="form-group mb-2">
                            <label class="block mb-1 text-gray-700">Roommates (comma-separated names):</label>
                            <input type="text" id="tenantRoommates" class="input-field">
                        </div>
                        <button type="submit" class="button mt-2">Add Tenant</button>
                    </form>
                `;
                break;
            case 'payments':
                html = `
                    <h2 class="text-2xl mb-4 font-bold text-gray-800">Payments</h2>
                    <div id="monthlyArchives" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        ${[...new Set((storage.payments || []).map(p => p.monthYear))]
                            .filter(monthYear => monthYear && (storage.payments || []).some(p => p.monthYear === monthYear))
                            .map(monthYear => `
                                <div class="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-100" onclick="showMonthlyPayments('${monthYear}')">
                                    <h3 class="text-lg font-semibold text-gray-800">Month: ${monthYear}</h3>
                                </div>
                            `).join('')}
                    </div>
                    <ul id="paymentsList" class="space-y-4">
                        ${(storage.houses || []).map(h => `
                            <li class="bg-white p-4 rounded-lg shadow-md">
                                <h3 class="text-lg font-semibold text-gray-800 mb-2">${h.address}</h3>
                                <div class="space-y-4">
                                    <div class="form-group mb-2">
                                        <label class="block mb-1 text-gray-700">Month and Year:</label>
                                        <input type="text" id="paymentMonth-${h.address}" class="input-field calendar-month" placeholder="YYYY-MM" required>
                                    </div>
                                    <button id="showPaymentTable-${h.address}" class="button mt-2">Show Payment Table</button>
                                    <div id="paymentTable-${h.address}" class="hidden mt-4"></div>
                                    <button id="showArchive-${h.address}" class="button mt-2">View Archive</button>
                                    <div id="archiveModal-${h.address}" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                                        <div class="bg-white p-6 rounded-lg shadow-md w-3/4 max-w-2xl">
                                            <h4 class="text-lg font-semibold text-gray-800 mb-2">Payment Archive for ${h.address}</h4>
                                            <ul id="archiveList-${h.address}" class="space-y-4"></ul>
                                            <button id="closeArchive-${h.address}" class="button mt-4">Close</button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                    <div id="monthlyPaymentsModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                        <div class="bg-white p-6 rounded-lg shadow-md w-3/4 max-w-2xl overflow-y-auto max-h-screen">
                            <h4 class="text-lg font-semibold text-gray-800 mb-2">Payments for Month</h4>
                            <div id="monthlyPaymentsContent"></div>
                            <button id="closeMonthlyPayments" class="button mt-4">Close</button>
                        </div>
                    </div>
                `;
                break;
            case 'invoices':
                html = `
                    <h2 class="text-2xl mb-4 font-bold text-gray-800">Invoices</h2>
                    <ul id="invoicesList" class="list-disc pl-5 space-y-4">
                        ${(storage.invoices || []).map(i => `<li class="bg-white p-4 rounded-lg shadow-md text-gray-700">${i.type} - ${i.amount || 0}€ - Paid: ${i.paid ? 'Yes' : 'No'}</li>`).join('')}
                    </ul>
                    <form id="addInvoiceForm" class="mt-4 bg-white p-4 rounded-lg shadow-md">
                        <div class="form-group mb-2">
                            <label class="block mb-1 text-gray-700">Type (Rent/Utility):</label>
                            <input type="text" id="invoiceType" class="input-field" required>
                        </div>
                        <div class="form-group mb-2">
                            <label class="block mb-1 text-gray-700">Amount (€):</label>
                            <input type="number" id="invoiceAmount" class="input-field" required>
                        </div>
                        <div class="form-group mb-2">
                            <label class="block mb-1 text-gray-700">Paid (yes/no):</label>
                            <input type="text" id="invoicePaid" class="input-field" placeholder="yes/no" required>
                        </div>
                        <button type="submit" class="button mt-2">Add Invoice</button>
                    </form>
                `;
                break;
            case 'overview':
                html = `
                    <h2 class="text-2xl mb-4 font-bold text-gray-800">Room Availability Overview</h2>
                    <div class="mb-4">
                             <label class="block mb-1 text-gray-700">Select Month:</label>
                            <input type="text" id="monthPicker" class="input-field calendar-month" placeholder="YYYY-MM" required>
                    </div>        
                    <div class="space-y-8">
                        ${(storage.houses || []).map(h => `
                            <div class="bg-white p-4 rounded-lg shadow-md">
                                <h3 class="text-lg font-semibold text-gray-800 mb-2">${h.address}</h3>
                                <div id="calendar-${h.address}" class="calendar mb-4"></div>
                                <div id="color-legend-${h.address}" class="mt-4"></div>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
        }
        content.innerHTML = html;

        // Add event listeners after rendering content
        flatpickr('.calendar', { dateFormat: 'Y-m-d' });
        flatpickr('.calendar-month', { 
            dateFormat: 'Y-m', 
            mode: 'single',
            defaultDate: "today"
        });

        // Handle authentication links
        const registerLink = document.getElementById('registerLink');
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Register link clicked');
                showSection('register');
            });
        }

        const loginLink = document.getElementById('loginLink');
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Login link clicked');
                showSection('login');
            });
        }

        // Handle authentication forms
        if (section === 'login') {
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('loginEmail')?.value.trim();
                    const password = document.getElementById('loginPassword')?.value;

                    if (!email || !password) {
                        alert('Please enter both email and password.');
                        return;
                    }

                    try {
                        await signInWithEmailAndPassword(auth, email, password);
                        // onAuthStateChanged will handle navigation
                    } catch (error) {
                        alert('Login failed: ' + error.message);
                    }
                });
            }
        }

        if (section === 'register') {
            const registerForm = document.getElementById('registerForm');
            if (registerForm) {
                registerForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('registerEmail')?.value.trim();
                    const password = document.getElementById('registerPassword')?.value;

                    if (!email || !password) {
                        alert('Please enter both email and password.');
                        return;
                    }

                    try {
                        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                        currentUser = userCredential.user.uid;
                        storage.houses = [];
                        storage.tenants = [];
                        storage.payments = [];
                        storage.invoices = [];
                        await saveData(currentUser);
                        // onAuthStateChanged will handle navigation
                    } catch (error) {
                        alert('Registration failed: ' + error.message);
                    }
                });
            }
        }

        // Render calendars for each house in the Overview section
        if (section === 'overview') {
            const monthPicker = document.getElementById('monthPicker');
            if (monthPicker) {
                flatpickr(monthPicker, {
                    dateFormat: 'Y-m',
                    mode: 'single',
                    defaultDate: "today",
                    onChange: (selectedDates, dateStr) => {
                        if (dateStr) {
                            const [year, month] = dateStr.split('-').map(Number);
                            (storage.houses || []).forEach(house => {
                                renderCalendar(house.address, year, month - 1); // month is 0-indexed in JavaScript
                            });
                        }
                    }
                });
        
                // Render the calendar for the current month initially
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const currentMonth = currentDate.getMonth();
                (storage.houses || []).forEach(house => {
                    renderCalendar(house.address, currentYear, currentMonth);
                });
            }
        }

        function renderCalendar(houseAddress, year, month) {
            const house = (storage.houses || []).find(h => h.address === houseAddress);
            if (!house) return;
        
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = new Date(year, month, 1).getDay();
        
            const calendar = document.getElementById(`calendar-${houseAddress}`);
            const legend = document.getElementById(`color-legend-${houseAddress}`);
        
            const roomColors = {};
            (house.rooms || []).forEach((room, index) => {
                const hue = (index * 60) % 360;
                roomColors[room.number] = `hsl(${hue}, 70%, 50%)`;
            });
        
            let calendarHtml = `
                <table class="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr class="bg-gray-100">
                            <th colspan="7" class="border border-gray-300 p-2 text-center">
                                ${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </th>
                        </tr>
                        <tr class="bg-gray-100">
                            <th class="border border-gray-300 p-2">Sun</th>
                            <th class="border border-gray-300 p-2">Mon</th>
                            <th class="border border-gray-300 p-2">Tue</th>
                            <th class="border border-gray-300 p-2">Wed</th>
                            <th class="border border-gray-300 p-2">Thu</th>
                            <th class="border border-gray-300 p-2">Fri</th>
                            <th class="border border-gray-300 p-2">Sat</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
        
            let day = 1;
            for (let i = 0; i < 6; i++) {
                calendarHtml += '<tr>';
                for (let j = 0; j < 7; j++) {
                    if ((i === 0 && j < firstDay) || day > daysInMonth) {
                        calendarHtml += '<td class="border border-gray-300 p-2"></td>';
                    } else {
                        const currentDate = new Date(year, month, day);
                        let cellContent = day;
                        let cellStyle = '';
        
                        const occupiedRooms = {};
                        (house.rooms || []).forEach(room => {
                            const tenantsInRoom = (storage.tenants || []).filter(t => 
                                t.house === houseAddress && 
                                t.room === room.number && 
                                new Date(t.startDate) <= currentDate && 
                                (!t.endDate || new Date(t.endDate) >= currentDate)
                            );
                            if (tenantsInRoom.length > 0) {
                                const roomColor = roomColors[room.number];
                                occupiedRooms[room.number] = {
                                    color: roomColor,
                                    tenants: tenantsInRoom.map(t => t.name)
                                };
                            }
                        });
        
                        if (Object.keys(occupiedRooms).length > 0) {
                            const numRooms = Object.keys(occupiedRooms).length;
                            let backgroundColors = '';
                            let tenantList = '';
                            Object.values(occupiedRooms).forEach(({ color, tenants }, index) => {
                                const width = `${100 / numRooms}%`;
                                backgroundColors += `${color} ${width}, `;
                                tenants.forEach(tenant => {
                                    tenantList += `<span style="color: ${color};"> ${tenant}</span>`;
                                });
                            });
                            backgroundColors = backgroundColors.slice(0, -2);
                            cellStyle = `background: linear-gradient(to right, ${backgroundColors}); color: black;`;
                            cellContent += `<br>${tenantList}`;
                        }
        
                        calendarHtml += `<td class="border border-gray-300 p-2" style="${cellStyle}">${cellContent}</td>`;
                        day++;
                    }
                }
                calendarHtml += '</tr>';
                if (day > daysInMonth) break;
            }
            calendarHtml += '</tbody></table>';
        
            if (calendar) calendar.innerHTML = calendarHtml;
        
            let legendHtml = '<h4 class="text-sm font-semibold text-gray-700 mb-2">Room Color Codes:</h4><ul class="list-disc pl-5">';
            (house.rooms || []).forEach(room => {
                const color = roomColors[room.number];
                legendHtml += `<li style="color: ${color};">Room ${room.number} - Capacity: ${room.capacity || 'Not set'}, Occupants: ${(room.occupants || []).length}</li>`;
            });
            legendHtml += '</ul>';
        
            if (legend) legend.innerHTML = legendHtml;
        }

        function renderPaymentTable(houseAddress, selectedMonth) {
            const [year, month] = selectedMonth.split('-').map(Number);
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0);
            
            const tenants = (storage.tenants || []).filter(t => {
                const startDate = new Date(t.startDate);
                const endDate = t.endDate ? new Date(t.endDate) : new Date();
                return (
                    t.house === houseAddress &&
                    (startDate <= endOfMonth && (endDate >= startOfMonth || !t.endDate))
                );
            });
        
            const paymentTable = document.getElementById(`paymentTable-${houseAddress}`);
            if (tenants.length === 0) {
                if (paymentTable) {
                    paymentTable.innerHTML = '<p class="text-gray-700">No tenants for this month.</p>';
                    paymentTable.classList.remove('hidden');
                }
                return;
            }
        
            const existingPayment = (storage.payments || []).find(p => p.house === houseAddress && p.monthYear === selectedMonth);
        
            const utilities = ['Hot and Cold Water, Heater', 'Electricity', 'Condominium', 'Garbage', 'WiFi'];
            let tableHtml = `
                <table class="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="border border-gray-300 p-2">Utility</th>
                            <th class="border border-gray-300 p-2">Bill</th>
                            ${tenants.map(t => `<th class="border border-gray-300 p-2">${t.name}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${utilities.map(utility => {
                            const utilityKey = utility.replace(/ /g, '-');
                            const existingBill = existingPayment?.payments?.find(p => p.utilityType === utility)?.billAmount || 0;
                            return `
                                <tr>
                                    <td class="border border-gray-300 p-2">${utility}</td>
                                    <td class="border border-gray-300 p-2">
                                        <input type="number" 
                                               id="bill-${houseAddress}-${utilityKey}" 
                                               class="input-field w-full border-gray-300 focus:border-blue-500" 
                                               min="0" step="0.01" 
                                               value="${existingBill}">
                                    </td>
                                    ${tenants.map(t => `<td class="border border-gray-300 p-2"></td>`).join('')}
                                </tr>
                            `;
                        }).join('')}
                        ${tenants.map(t => {
                            const existingRent = existingPayment?.payments?.find(p => p.utilityType === `Rent - ${t.name}`)?.billAmount || t.rent || 0;
                            const isPaid = existingPayment?.payments?.find(p => p.utilityType === `Rent - ${t.name}`)?.paid || false;
                            const amountPaid = existingPayment?.payments?.find(p => p.utilityType === `Rent - ${t.name}`)?.amountPaid || 0;
                            return `
                                <tr>
                                    <td class="border border-gray-300 p-2">
                                        Rent - ${t.name}
                                        <input type="checkbox" 
                                               id="paid-${houseAddress}-${t.name}" 
                                               class="w-5 h-5 ml-2" 
                                               ${isPaid ? 'checked' : ''}>
                                    </td>
                                    <td class="border border-gray-300 p-2">
                                        <input type="number" 
                                               id="rent-${houseAddress}-${t.name}" 
                                               class="input-field w-full border-gray-300 focus:border-blue-500" 
                                               min="0" step="0.01" 
                                               value="${existingRent}">
                                    </td>
                                    ${tenants.map(tenant => `
                                        <td class="border border-gray-300 p-2">
                                            ${tenant.name === t.name ? `
                                                <input type="number" 
                                                       id="sum-paid-${houseAddress}-${t.name}" 
                                                       class="input-field w-full border-gray-300 focus:border-blue-500" 
                                                       min="0" step="0.01" 
                                                       value="${amountPaid}"
                                                       placeholder="Amount Paid">
                                            ` : ''}
                                        </td>
                                    `).join('')}
                                </tr>
                            `;
                        }).join('')}
                        <tr class="bg-gray-100">
                            <td class="border border-gray-300 p-2 font-bold">Sum</td>
                            <td class="border border-gray-300 p-2" id="totalBill-${houseAddress}">0.00€</td>
                            ${tenants.map(t => `
                                <td class="border border-gray-300 p-2"></td>
                            `).join('')}
                        </tr>
                    </tbody>
                </table>
                <button id="savePayment-${houseAddress}" class="button mt-4">Save Payment</button>
            `;
        
            if (paymentTable) {
                paymentTable.innerHTML = tableHtml;
                paymentTable.classList.remove('hidden');
        
                utilities.forEach(utility => {
                    const utilityKey = utility.replace(/ /g, '-');
                    const input = document.getElementById(`bill-${houseAddress}-${utilityKey}`);
                    input?.addEventListener('input', () => updateTotalBill(houseAddress));
                });
                tenants.forEach(t => {
                    const rentInput = document.getElementById(`rent-${houseAddress}-${t.name}`);
                    rentInput?.addEventListener('input', () => updateTotalBill(houseAddress));
                });
        
                updateTotalBill(houseAddress);
        
                document.getElementById(`savePayment-${houseAddress}`)?.addEventListener('click', () => {
                    savePayment(houseAddress, selectedMonth);
                });
            }
        }

        function updateTotalBill(houseAddress) {
            const utilities = ['Hot and Cold Water, Heater', 'Electricity', 'Condominium', 'Garbage', 'WiFi'];
            const tenants = (storage.tenants || []).filter(t => t.house === houseAddress);
            let total = 0;

            utilities.forEach(utility => {
                const utilityKey = utility.replace(/ /g, '-');
                const input = document.getElementById(`bill-${houseAddress}-${utilityKey}`);
                total += parseFloat(input?.value) || 0;
            });

            tenants.forEach(t => {
                const rentInput = document.getElementById(`rent-${houseAddress}-${t.name}`);
                // total += parseFloat(rentInput?.value) || 0;
            });

            const totalBillElement = document.getElementById(`totalBill-${houseAddress}`);
            if (totalBillElement) {
                totalBillElement.textContent = `${total.toFixed(2)}€`;
            }
        }

        async function savePayment(houseAddress, monthYear) {
            const utilities = ['Hot-and-Cold-Water,-Heater', 'Electricity', 'Condominium', 'Garbage', 'WiFi'];
            const tenants = (storage.tenants || []).filter(t => t.house === houseAddress);

            const payment = {
                house: houseAddress,
                monthYear,
                payments: [
                    ...utilities.map(utility => {
                        const utilityKey = utility.replace(/-/g, ' ');
                        const billAmount = parseFloat(document.getElementById(`bill-${houseAddress}-${utility.replace(/ /g, '-')}`)?.value || 0);
                        return { utilityType: utilityKey, billAmount };
                    }),
                    ...tenants.map(t => {
                        const billAmount = parseFloat(document.getElementById(`rent-${houseAddress}-${t.name}`)?.value || t.rent || 0);
                        const paid = document.getElementById(`paid-${houseAddress}-${t.name}`)?.checked || false;
                        const amountPaid = parseFloat(document.getElementById(`sum-paid-${houseAddress}-${t.name}`)?.value || 0);
                        return { utilityType: `Rent - ${t.name}`, billAmount, paid, amountPaid };
                    })
                ],
                timestamp: new Date().toISOString()
            };

            const existingPaymentIndex = (storage.payments || []).findIndex(p => p.house === houseAddress && p.monthYear === monthYear);
            if (existingPaymentIndex !== -1) {
                storage.payments[existingPaymentIndex] = payment;
            } else {
                storage.payments.push(payment);
            }
            await saveData(currentUser);
            alert(`Payment for ${monthYear} saved!`);
            showSection('payments');
        }

        function renderArchive(houseAddress) {
            const modal = document.getElementById(`archiveModal-${houseAddress}`);
            const archiveList = document.getElementById(`archiveList-${houseAddress}`);
            const payments = (storage.payments || []).filter(p => p.house === houseAddress);

            let archiveHtml = payments.map(p => `
                <li class="bg-white p-4 rounded-lg shadow-md mb-4">
                    <div class="flex justify-between items-center">
                        <h3 class="font-bold">${p.monthYear}</h3>
                        <button onclick="removePayment('${houseAddress}', '${p.monthYear}')" 
                                class="text-red-500 hover:text-red-700">
                            ✕
                        </button>
                    </div>
                    <table class="w-full mt-2">
                        ${(p.payments || []).map(payment => `
                            <tr>
                                <td class="pr-4">${payment.utilityType}:</td>
                                <td>${(payment.billAmount || 0).toFixed(2)}€</td>
                                ${payment.paid !== undefined ? `
                                    <td class="pl-4">Paid: ${payment.paid ? '✓' : '✗'}</td>
                                    <td class="pl-4">Amount Paid: ${(payment.amountPaid || 0).toFixed(2)}€</td>
                                ` : ''}
                            </tr>
                        `).join('')}
                    </table>
                </li>
            `).join('');

            if (archiveList) {
                archiveList.innerHTML = archiveHtml || '<p class="text-gray-700">No previous payments found.</p>';
            }
            if (modal) modal.classList.remove('hidden');
        }

        if (section === 'settings') {
            document.getElementById('addHouseForm')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const address = document.getElementById('houseAddress')?.value.trim();
                if (!address) {
                    alert('Please enter a house address.');
                    return;
                }
                if ((storage.houses || []).some(h => h.address === address)) {
                    alert('House already exists!');
                    return;
                }
                storage.houses.push({ address, rooms: [] });
                await saveData(currentUser);
                showSection('settings');
            });

            (storage.houses || []).forEach(house => {
                const formId = `addRoomForm-${house.address}`;
                const form = document.getElementById(formId);
                if (form) {
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const roomNumberInput = form.querySelector('input[type="text"]');
                        const capacityInput = form.querySelector('input[type="number"]');
                        const roomNumber = roomNumberInput?.value.trim();
                        const capacity = parseInt(capacityInput?.value);

                        if (!roomNumber || !capacity || capacity <= 0) {
                            alert('Please provide valid room number and capacity.');
                            return;
                        }

                        if ((house.rooms || []).some(r => r.number === roomNumber)) {
                            alert('Room already exists!');
                            return;
                        }

                        house.rooms.push({ number: roomNumber, capacity, occupants: [] });
                        await saveData(currentUser);
                        showSection('settings');
                    });
                }
            });
        }

        if (section === 'tenants') {
            document.getElementById('addTenantForm')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('tenantName')?.value.trim();
                const startDate = document.getElementById('tenantStartDate')?.value;
                const endDate = document.getElementById('tenantEndDate')?.value || null;
                const house = document.getElementById('tenantHouse')?.value;
                const room = document.getElementById('tenantRoom')?.value;
                const rent = parseFloat(document.getElementById('tenantRent')?.value);
                const roommates = document.getElementById('tenantRoommates')?.value.split(',').map(r => r.trim()).filter(r => r);

                if (!name || !startDate || !house || !room || isNaN(rent)) {
                    alert('Please fill in all required fields, including a valid rent amount.');
                    return;
                }

                const selectedHouse = (storage.houses || []).find(h => h.address === house);
                if (!selectedHouse) {
                    alert('House not found!');
                    return;
                }

                const selectedRoom = (selectedHouse.rooms || []).find(r => r.number === room);
                if (!selectedRoom) {
                    alert('Room not found!');
                    return;
                }

                const newTenantStartDate = new Date(startDate);
                const newTenantEndDate = endDate ? new Date(endDate) : null;

                const overlappingTenants = (selectedRoom.occupants || []).filter(occupantName => {
                    const existingTenant = (storage.tenants || []).find(t => t.name === occupantName && t.house === house && t.room === room);
                    if (!existingTenant) return false;

                    const existingTenantStartDate = new Date(existingTenant.startDate);
                    const existingTenantEndDate = existingTenant.endDate ? new Date(existingTenant.endDate) : null;

                    return (
                        (newTenantEndDate === null || existingTenantStartDate <= newTenantEndDate) &&
                        (existingTenantEndDate === null || newTenantStartDate <= existingTenantEndDate)
                    );
                });

                if (overlappingTenants.length >= selectedRoom.capacity) {
                    alert('Room is at full capacity during the specified period!');
                    return;
                }

                storage.tenants.push({ name, startDate, endDate, house, room, rent, roommates });
                selectedRoom.occupants.push(name);
                await saveData(currentUser);
                showSection('tenants');
            });

            const houseSelect = document.getElementById('tenantHouse');
            const roomSelect = document.getElementById('tenantRoom');
            if (houseSelect && roomSelect) {
                houseSelect.addEventListener('change', () => {
                    const selectedHouse = (storage.houses || []).find(h => h.address === houseSelect.value);
                    roomSelect.innerHTML = '<option value="">Select Room</option>';
                    if (selectedHouse) {
                        (selectedHouse.rooms || []).forEach(room => {
                            const option = document.createElement('option');
                            option.value = room.number;
                            option.text = `Room ${room.number} (Capacity: ${room.capacity}, Occupants: ${(room.occupants || []).length})`;
                            roomSelect.appendChild(option);
                        });
                    }
                });
            }
        }

        if (section === 'payments') {
            (storage.houses || []).forEach(house => {
                const paymentMonthInput = document.getElementById(`paymentMonth-${house.address}`);
                if (paymentMonthInput) {
                    flatpickr(paymentMonthInput, {
                        dateFormat: 'Y-m',
                        mode: 'single',
                        defaultDate: "today",
                        onChange: (selectedDates, dateStr) => {
                            if (dateStr) {
                                renderPaymentTable(house.address, dateStr);
                            }
                        }
                    });
                }

                document.getElementById(`showPaymentTable-${house.address}`)?.addEventListener('click', () => {
                    const monthYear = document.getElementById(`paymentMonth-${house.address}`)?.value;
                    if (monthYear) {
                        renderPaymentTable(house.address, monthYear);
                    } else {
                        alert('Please select a month and year first.');
                    }
                });

                document.getElementById(`showArchive-${house.address}`)?.addEventListener('click', () => {
                    renderArchive(house.address);
                });

                document.getElementById(`closeArchive-${house.address}`)?.addEventListener('click', () => {
                    document.getElementById(`archiveModal-${house.address}`).classList.add('hidden');
                });
            });

            document.getElementById('closeMonthlyPayments')?.addEventListener('click', () => {
                document.getElementById('monthlyPaymentsModal').classList.add('hidden');
            });
        }

        if (section === 'invoices') {
            document.getElementById('addInvoiceForm')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const type = document.getElementById('invoiceType')?.value.trim();
                const amount = parseFloat(document.getElementById('invoiceAmount')?.value);
                const paid = document.getElementById('invoicePaid')?.value.toLowerCase() === 'yes';

                if (!type || isNaN(amount)) {
                    alert('Please provide valid invoice details.');
                    return;
                }

                storage.invoices.push({ type, amount, paid });
                await saveData(currentUser);
                showSection('invoices');
            });
        }
    }

    window.removeHouse = async function(address) {
        storage.houses = (storage.houses || []).filter(h => h.address !== address);
        storage.tenants = (storage.tenants || []).filter(t => t.house !== address);
        storage.payments = (storage.payments || []).filter(p => p.house !== address);
        await saveData(currentUser);
        showSection('settings');
    };

    window.removeTenant = async function(name, house, room) {
        storage.tenants = (storage.tenants || []).filter(t => t.name !== name || t.house !== house || t.room !== room);
        const selectedHouse = (storage.houses || []).find(h => h.address === house);
        if (selectedHouse) {
            const selectedRoom = (selectedHouse.rooms || []).find(r => r.number === room);
            if (selectedRoom) {
                selectedRoom.occupants = (selectedRoom.occupants || []).filter(o => o !== name);
            }
        }
        storage.payments = (storage.payments || []).map(p => ({
            ...p,
            payments: (p.payments || []).map(pp => ({
                ...pp,
                tenantPayments: (pp.tenantPayments || []).filter(tp => tp.name !== name)
            }))
        }));
        await saveData(currentUser);
        showSection('tenants');
    };

    window.removePayment = async function(houseAddress, monthYear) {
        storage.payments = (storage.payments || []).filter(p => 
            !(p.house === houseAddress && p.monthYear === monthYear)
        );
        await saveData(currentUser);
        const archiveList = document.getElementById(`archiveList-${houseAddress}`);
        if (archiveList) {
            renderArchive(houseAddress);
        }
    };

    window.showMonthlyPayments = function(monthYear) {
        const monthlyPaymentsContent = document.getElementById('monthlyPaymentsContent');
        let contentHtml = (storage.houses || []).map(h => `
            <div class="bg-white p-4 rounded-lg shadow-md mb-4">
                <h4 class="text-md font-semibold text-gray-800 mb-2">${h.address}</h4>
                <table class="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="border border-gray-300 p-2">Utility</th>
                            <th class="border border-gray-300 p-2">Bill</th>
                            <th class="border border-gray-300 p-2">Paid</th>
                            <th class="border border-gray-300 p-2">Amount Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(storage.payments || []).filter(p => p.house === h.address && p.monthYear === monthYear).map(p => `
                            ${(p.payments || []).map(payment => `
                                <tr>
                                    <td class="border border-gray-300 p-2">${payment.utilityType}</td>
                                    <td class="border border-gray-300 p-2">${(payment.billAmount || 0).toFixed(2)}€</td>
                                    <td class="border border-gray-300 p-2">${payment.paid !== undefined ? (payment.paid ? '✓' : '✗') : '-'}</td>
                                    <td class="border border-gray-300 p-2">${payment.amountPaid !== undefined ? (payment.amountPaid || 0).toFixed(2) + '€' : '-'}</td>
                                </tr>
                            `).join('')}
                        `).join('') || '<tr><td colspan="4" class="border border-gray-300 p-2 text-gray-700">No payments for this month.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `).join('');

        if (monthlyPaymentsContent) {
            monthlyPaymentsContent.innerHTML = contentHtml || '<p class="text-gray-700">No payments for this month.</p>';
            document.getElementById('monthlyPaymentsModal').classList.remove('hidden');
        }
    };

    window.logout = async function() {
        try {
            await signOut(auth);
            nav.classList.add('hidden');
            showAuth();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    function showAuth() {
        showSection('login');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substring(1);
            if (section !== 'logout') {
                showSection(section);
            }
        });
    });
});