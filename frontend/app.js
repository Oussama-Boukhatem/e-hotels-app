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

const rentingForm = document.getElementById("rentingForm");
if (rentingForm) {
  rentingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bookingIdValue = document.getElementById("bookingId").value;

    const payload = {
      startDate: document.getElementById("rentingStartDate").value,
      endDate: document.getElementById("rentingEndDate").value,
      customerId: Number(document.getElementById("rentingCustomerId").value),
      roomId: Number(document.getElementById("rentingRoomId").value),
      employeeId: Number(document.getElementById("employeeId").value),
      bookingId: bookingIdValue ? Number(bookingIdValue) : null,
    };

    const response = await fetch(`${API_BASE}/rentings`, {
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
    const response = await fetch(`${API_BASE}/views/available-rooms-per-area`);
    const data = await response.json();

    let html =
      '<table border="1"><tr><th>Area</th><th>Available Rooms</th></tr>';
    data.data.forEach((row) => {
      html += `<tr><td>${row.area}</td><td>${row.numberofavailablerooms}</td></tr>`;
    });
    html += "</table>";

    document.getElementById("availableRoomsView").innerHTML = html;
  });
}

const loadHotelCapacity = document.getElementById("loadHotelCapacity");
if (loadHotelCapacity) {
  loadHotelCapacity.addEventListener("click", async () => {
    const response = await fetch(`${API_BASE}/views/hotel-aggregated-capacity`);
    const data = await response.json();

    let html =
      '<table border="1"><tr><th>Hotel ID</th><th>Hotel Address</th><th>Total Capacity</th></tr>';
    data.data.forEach((row) => {
      html += `<tr>
        <td>${row.hotelid}</td>
        <td>${row.hoteladdress}</td>
        <td>${row.totalcapacity}</td>
      </tr>`;
    });
    html += "</table>";

    document.getElementById("hotelCapacityView").innerHTML = html;
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
