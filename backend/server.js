const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/views/available-rooms-per-area", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM AvailableRoomsPerArea");
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/views/hotel-aggregated-capacity", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM HotelAggregatedCapacity");
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("e-Hotels backend running");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/rooms/available", async (req, res) => {
  try {
    const { area, startDate, endDate, capacity } = req.query;

    if (!area || !startDate || !endDate || !capacity) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required query parameters: area, startDate, endDate, capacity",
      });
    }

    const query = `
      SELECT r.RoomID, r.Price, r.Capacity, r.ViewType, h.HotelAddress, h.CategoryStars
      FROM Room r
      JOIN Hotel h ON r.HotelID = h.HotelID
      WHERE h.HotelAddress ILIKE $1
        AND r.Capacity = $2
        AND r.RoomID NOT IN (
            SELECT b.RoomID
            FROM Booking b
            WHERE NOT (b.EndDate <= $3 OR b.StartDate >= $4)
        )
        AND r.RoomID NOT IN (
            SELECT rt.RoomID
            FROM Renting rt
            WHERE NOT (rt.EndDate <= $3 OR rt.StartDate >= $4)
        )
      ORDER BY r.RoomID;
    `;

    const values = [`%${area}%`, capacity, startDate, endDate];
    const result = await pool.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      rooms: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/bookings", async (req, res) => {
  try {
    const { startDate, endDate, customerId, roomId } = req.body;

    if (!startDate || !endDate || !customerId || !roomId) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: startDate, endDate, customerId, roomId",
      });
    }

    const query = `
      INSERT INTO Booking (StartDate, EndDate, CustomerID, RoomID)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [startDate, endDate, customerId, roomId];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      booking: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/rentings", async (req, res) => {
  try {
    const { startDate, endDate, customerId, roomId, employeeId, bookingId } =
      req.body;

    if (!startDate || !endDate || !customerId || !roomId || !employeeId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const query = `
      INSERT INTO Renting (StartDate, EndDate, CustomerID, RoomID, CheckInEmployeeID, BookingID)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *;
    `;

    const values = [
      startDate,
      endDate,
      customerId,
      roomId,
      employeeId,
      bookingId || null,
    ];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      renting: result.rows[0],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.use(express.static(path.join(__dirname, "../frontend")));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
