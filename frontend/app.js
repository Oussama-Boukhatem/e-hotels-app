const API_BASE = "http://localhost:3000";

const roomSearchForm = document.getElementById("roomSearchForm");

if (roomSearchForm) {
  async function searchRooms() {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (!startDate || !endDate) return;

    const capacity = document.getElementById("capacity").value;
    const area = document.getElementById("area").value;
    const chainId = document.getElementById("chainId").value;
    const categoryStars = document.getElementById("categoryStars").value;
    const minRooms = document.getElementById("minRooms").value;
    const maxPrice = document.getElementById("maxPrice").value;

    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    if (capacity) params.append("capacity", capacity);
    if (area) params.append("area", area);
    if (chainId) params.append("chainId", chainId);
    if (categoryStars) params.append("categoryStars", categoryStars);
    if (minRooms) params.append("minRooms", minRooms);
    if (maxPrice) params.append("maxPrice", maxPrice);

    const response = await fetch(`/rooms/available?${params.toString()}`);
    const data = await response.json();

    const resultsDiv = document.getElementById("roomResults");

    if (!data.success) {
      resultsDiv.innerHTML = `<p>${data.error}</p>`;
      return;
    }

    if (data.rooms.length === 0) {
      resultsDiv.innerHTML = "<p>No rooms found</p>";
      return;
    }

    let html = `<table border="1">
<tr>
<th>RoomID</th>
<th>Price</th>
<th>Capacity</th>
<th>View</th>
<th>Hotel</th>
<th>Stars</th>
<th>Action</th>
</tr>`;

    data.rooms.forEach((room) => {
      html += `<tr>
<td>${room.roomid}</td>
<td>${room.price}</td>
<td>${room.capacity}</td>
<td>${room.viewtype}</td>
<td>${room.hoteladdress}</td>
<td>${room.categorystars}</td>
<td>
<button onclick="bookRoom(${room.roomid})">
Book
</button>
</td>
</tr>`;
    });

    html += `</table>`;

    resultsDiv.innerHTML = html;
  }

  const inputs = roomSearchForm.querySelectorAll("input, select");

  inputs.forEach((input) => {
    input.addEventListener("change", searchRooms);
    input.addEventListener("input", searchRooms);
  });

  roomSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchRooms();
  });
}

const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      startDate: document.getElementById("bookingStartDate").value,
      endDate: document.getElementById("bookingEndDate").value,
      customerId: Number(document.getElementById("customerId").value),
      roomId: Number(document.getElementById("roomId").value),
    };

    const response = await fetch(`${API_BASE}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    document.getElementById("bookingResult").innerHTML =
      `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  });
}

const loadBookingsBtn = document.getElementById("loadBookingsBtn");

if (loadBookingsBtn) {
  loadBookingsBtn.addEventListener("click", async () => {
    const response = await fetch("/bookings");
    const data = await response.json();

    const bookingList = document.getElementById("bookingList");

    if (!data.success) {
      bookingList.innerHTML = `<p>${data.error}</p>`;
      return;
    }

    if (data.bookings.length === 0) {
      bookingList.innerHTML = "<p>No bookings found</p>";
      return;
    }

    let html = `<table border="1">
      <tr>
        <th>BookingID</th>
        <th>StartDate</th>
        <th>EndDate</th>
        <th>CustomerID</th>
        <th>RoomID</th>
      </tr>`;

    data.bookings.forEach((booking) => {
      html += `<tr>
        <td>${booking.bookingid}</td>
        <td>${booking.startdate.substring(0, 10)}</td>
        <td>${booking.enddate.substring(0, 10)}</td>
        <td>${booking.customerid}</td>
        <td>${booking.roomid}</td>
      </tr>`;
    });

    html += `</table>`;
    bookingList.innerHTML = html;
  });
}

const convertBookingForm = document.getElementById("convertBookingForm");

if (convertBookingForm) {
  convertBookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bookingId = Number(document.getElementById("convertBookingId").value);
    const employeeId = Number(
      document.getElementById("convertEmployeeId").value,
    );
    const paymentAmountValue = document.getElementById(
      "convertPaymentAmount",
    ).value;

    const bookingResponse = await fetch("/bookings");
    const bookingData = await bookingResponse.json();

    if (!bookingData.success) {
      document.getElementById("rentingResult").innerHTML =
        `<p>${bookingData.error}</p>`;
      return;
    }

    const booking = bookingData.bookings.find((b) => b.bookingid === bookingId);

    if (!booking) {
      document.getElementById("rentingResult").innerHTML =
        "<p>Booking not found</p>";
      return;
    }

    const payload = {
      startDate: booking.startdate.substring(0, 10),
      endDate: booking.enddate.substring(0, 10),
      customerId: booking.customerid,
      roomId: booking.roomid,
      employeeId: employeeId,
      bookingId: booking.bookingid,
      paymentAmount: paymentAmountValue ? Number(paymentAmountValue) : null,
    };

    const response = await fetch("/rentings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    document.getElementById("rentingResult").innerHTML =
      `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  });
}

const directRentingForm = document.getElementById("directRentingForm");

if (directRentingForm) {
  directRentingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const paymentAmountValue = document.getElementById(
      "directPaymentAmount",
    ).value;

    const payload = {
      startDate: document.getElementById("directStartDate").value,
      endDate: document.getElementById("directEndDate").value,
      customerId: Number(document.getElementById("directCustomerId").value),
      roomId: Number(document.getElementById("directRoomId").value),
      employeeId: Number(document.getElementById("directEmployeeId").value),
      bookingId: null,
      paymentAmount: paymentAmountValue ? Number(paymentAmountValue) : null,
    };

    const response = await fetch("/rentings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    document.getElementById("rentingResult").innerHTML =
      `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  });
}

const loadAvailableRooms = document.getElementById("loadAvailableRooms");

if (loadAvailableRooms) {
  loadAvailableRooms.addEventListener("click", async () => {
    const res = await fetch("/views/available-rooms-per-area");
    const data = await res.json();

    const div = document.getElementById("availableRoomsView");

    if (!data.success) {
      div.innerHTML = data.error;
      return;
    }

    let html = `<table border="1">
    <tr>
      <th>Area</th>
      <th>Number Of Available Rooms</th>
    </tr>`;

    data.data.forEach((row) => {
      html += `<tr>
        <td>${row.area}</td>
        <td>${row.numberofavailablerooms}</td>
      </tr>`;
    });

    html += `</table>`;
    div.innerHTML = html;
  });
}

const loadHotelCapacity = document.getElementById("loadHotelCapacity");

if (loadHotelCapacity) {
  loadHotelCapacity.addEventListener("click", async () => {
    const res = await fetch("/views/hotel-aggregated-capacity");
    const data = await res.json();

    const div = document.getElementById("hotelCapacityView");

    if (!data.success) {
      div.innerHTML = data.error;
      return;
    }

    let html = `<table border="1">
    <tr>
      <th>Hotel ID</th>
      <th>Hotel Address</th>
      <th>Total Capacity</th>
    </tr>`;

    data.data.forEach((row) => {
      html += `<tr>
        <td>${row.hotelid}</td>
        <td>${row.hoteladdress}</td>
        <td>${row.totalcapacity}</td>
      </tr>`;
    });

    html += `</table>`;
    div.innerHTML = html;
  });
}

async function bookRoom(roomId) {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  const customerId = prompt("Enter your Customer ID");

  if (!customerId) return;

  const response = await fetch("/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      roomId,
      customerId,
      startDate,
      endDate,
    }),
  });

  const data = await response.json();

  if (data.success) {
    alert("Booking created successfully");
  } else {
    alert(data.error);
  }
}

const loadCustomersBtn = document.getElementById("loadCustomersBtn");

if (loadCustomersBtn) {
  loadCustomersBtn.addEventListener("click", async () => {
    const res = await fetch("/customers");
    const data = await res.json();

    const div = document.getElementById("customerTable");

    if (!data.success) {
      div.innerHTML = data.error;
      return;
    }

    let html = `<table border="1">
<tr>
<th>ID</th>
<th>Name</th>
<th>Address</th>
<th>Action</th>
</tr>`;

    data.customers.forEach((c) => {
      html += `<tr>
<td>${c.customerid}</td>
<td>${c.fullname}</td>
<td>${c.address}</td>
<td>
<button onclick="deleteCustomer(${c.customerid})">Delete</button>
</td>
</tr>`;
    });

    html += `</table>`;

    div.innerHTML = html;
  });
}

const addCustomerForm = document.getElementById("addCustomerForm");

if (addCustomerForm) {
  addCustomerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      fullName: document.getElementById("customerName").value,
      address: document.getElementById("customerAddress").value,
      idType: document.getElementById("customerIdType").value,
      idNumber: document.getElementById("customerIdNumber").value,
    };

    const res = await fetch("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    alert(JSON.stringify(data));
  });
}

async function deleteCustomer(id) {
  await fetch(`/customers/${id}`, {
    method: "DELETE",
  });

  alert("Customer deleted");
}

const loadEmployeesBtn = document.getElementById("loadEmployeesBtn");

if (loadEmployeesBtn) {
  loadEmployeesBtn.addEventListener("click", async () => {
    const res = await fetch("/employees");
    const data = await res.json();

    const div = document.getElementById("employeeTable");

    if (!data.success) {
      div.innerHTML = data.error;
      return;
    }

    let html = `<table border="1">
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Address</th>
      <th>SSN/SIN</th>
      <th>HotelID</th>
      <th>Action</th>
    </tr>`;

    data.employees.forEach((e) => {
      html += `<tr>
        <td>${e.employeeid}</td>
        <td>${e.fullname}</td>
        <td>${e.address}</td>
        <td>${e.ssn_sin}</td>
        <td>${e.hotelid}</td>
        <td>
          <button onclick="deleteEmployee(${e.employeeid})">Delete</button>
        </td>
      </tr>`;
    });

    html += `</table>`;
    div.innerHTML = html;
  });
}

const addEmployeeForm = document.getElementById("addEmployeeForm");

if (addEmployeeForm) {
  addEmployeeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      fullName: document.getElementById("employeeName").value,
      address: document.getElementById("employeeAddress").value,
      ssnSin: document.getElementById("employeeSSN").value,
      hotelId: Number(document.getElementById("employeeHotelId").value),
    };

    const res = await fetch("/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    alert(JSON.stringify(data));
  });
}

async function deleteEmployee(id) {
  await fetch(`/employees/${id}`, {
    method: "DELETE",
  });

  alert("Employee deleted");
}

const loadHotelsBtn = document.getElementById("loadHotelsBtn");

if (loadHotelsBtn) {
  loadHotelsBtn.addEventListener("click", async () => {
    const res = await fetch("/hotels");
    const data = await res.json();

    const div = document.getElementById("hotelTable");

    if (!data.success) {
      div.innerHTML = data.error;
      return;
    }

    let html = `<table border="1">
    <tr>
      <th>ID</th>
      <th>Address</th>
      <th>Stars</th>
      <th>Rooms</th>
      <th>ChainID</th>
      <th>ManagerEmployeeID</th>
      <th>Action</th>
    </tr>`;

    data.hotels.forEach((h) => {
      html += `<tr>
        <td>${h.hotelid}</td>
        <td>${h.hoteladdress}</td>
        <td>${h.categorystars}</td>
        <td>${h.numberofrooms}</td>
        <td>${h.chainid}</td>
        <td>${h.manageremployeeid ?? ""}</td>
        <td>
          <button onclick="deleteHotel(${h.hotelid})">Delete</button>
        </td>
      </tr>`;
    });

    html += `</table>`;
    div.innerHTML = html;
  });
}

const addHotelForm = document.getElementById("addHotelForm");

if (addHotelForm) {
  addHotelForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const managerValue = document.getElementById(
      "hotelManagerEmployeeId",
    ).value;

    const payload = {
      hotelAddress: document.getElementById("hotelAddress").value,
      categoryStars: Number(
        document.getElementById("hotelCategoryStars").value,
      ),
      numberOfRooms: Number(
        document.getElementById("hotelNumberOfRooms").value,
      ),
      chainId: Number(document.getElementById("hotelChainId").value),
      managerEmployeeId: managerValue ? Number(managerValue) : null,
    };

    const res = await fetch("/hotels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    alert(JSON.stringify(data));
  });
}

async function deleteHotel(id) {
  await fetch(`/hotels/${id}`, {
    method: "DELETE",
  });

  alert("Hotel deleted");
}

const loadRoomsBtn = document.getElementById("loadRoomsBtn");

if (loadRoomsBtn) {
  loadRoomsBtn.addEventListener("click", async () => {
    const res = await fetch("/rooms");
    const data = await res.json();

    const div = document.getElementById("roomManagementTable");

    if (!data.success) {
      div.innerHTML = data.error;
      return;
    }

    let html = `<table border="1">
    <tr>
      <th>ID</th>
      <th>Price</th>
      <th>Capacity</th>
      <th>View</th>
      <th>Extendable</th>
      <th>Problem/Damage</th>
      <th>HotelID</th>
      <th>Action</th>
    </tr>`;

    data.rooms.forEach((r) => {
      html += `<tr>
        <td>${r.roomid}</td>
        <td>${r.price}</td>
        <td>${r.capacity}</td>
        <td>${r.viewtype}</td>
        <td>${r.extendable}</td>
        <td>${r.problemdamagenotes ?? ""}</td>
        <td>${r.hotelid}</td>
        <td>
          <button onclick="deleteRoom(${r.roomid})">Delete</button>
        </td>
      </tr>`;
    });

    html += `</table>`;
    div.innerHTML = html;
  });
}

const addRoomForm = document.getElementById("addRoomForm");

if (addRoomForm) {
  addRoomForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      price: Number(document.getElementById("roomPrice").value),
      capacity: document.getElementById("roomCapacity").value,
      viewType: document.getElementById("roomViewType").value,
      extendable: document.getElementById("roomExtendable").value === "true",
      problemDamageNotes: document.getElementById("roomProblemDamageNotes")
        .value,
      hotelId: Number(document.getElementById("roomHotelId").value),
    };

    const res = await fetch("/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    alert(JSON.stringify(data));
  });
}

async function deleteRoom(id) {
  await fetch(`/rooms/${id}`, {
    method: "DELETE",
  });

  alert("Room deleted");
}
