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
    const result = await pool.query(`
      SELECT *
      FROM AvailableRoomsPerArea
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/views/hotel-aggregated-capacity", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM HotelAggregatedCapacity
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
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
    const {
      startDate,
      endDate,
      capacity,
      area,
      chainId,
      categoryStars,
      minRooms,
      maxPrice,
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "startDate and endDate are required",
      });
    }

    let query = `
      SELECT
        r.RoomID,
        r.Price,
        r.Capacity,
        r.ViewType,
        h.HotelID,
        h.HotelAddress,
        h.CategoryStars,
        h.NumberOfRooms,
        h.ChainID
      FROM Room r
      JOIN Hotel h ON r.HotelID = h.HotelID
      WHERE r.RoomID NOT IN (
        SELECT b.RoomID
        FROM Booking b
        WHERE NOT (b.EndDate <= $1 OR b.StartDate >= $2)
      )
      AND r.RoomID NOT IN (
        SELECT rt.RoomID
        FROM Renting rt
        WHERE NOT (rt.EndDate <= $1 OR rt.StartDate >= $2)
      )
    `;

    const values = [startDate, endDate];
    let paramIndex = 3;

    if (capacity) {
      query += ` AND r.Capacity = $${paramIndex}`;
      values.push(capacity);
      paramIndex++;
    }

    if (area) {
      query += ` AND h.HotelAddress ILIKE $${paramIndex}`;
      values.push(`%${area}%`);
      paramIndex++;
    }

    if (chainId) {
      query += ` AND h.ChainID = $${paramIndex}`;
      values.push(Number(chainId));
      paramIndex++;
    }

    if (categoryStars) {
      query += ` AND h.CategoryStars = $${paramIndex}`;
      values.push(Number(categoryStars));
      paramIndex++;
    }

    if (minRooms) {
      query += ` AND h.NumberOfRooms >= $${paramIndex}`;
      values.push(Number(minRooms));
      paramIndex++;
    }

    if (maxPrice) {
      query += ` AND r.Price <= $${paramIndex}`;
      values.push(Number(maxPrice));
      paramIndex++;
    }

    query += ` ORDER BY r.RoomID`;

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
    const {
      startDate,
      endDate,
      customerId,
      roomId,
      employeeId,
      bookingId,
      paymentAmount,
    } = req.body;

    if (!startDate || !endDate || !customerId || !roomId || !employeeId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const query = `
  INSERT INTO Renting (
    StartDate,
    EndDate,
    CheckInAt,
    CustomerID,
    RoomID,
    CheckInEmployeeID,
    BookingID,
    PaymentAmount,
    PaymentDate
  )
  VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6, $7::NUMERIC, CASE WHEN $7::NUMERIC IS NOT NULL THEN CURRENT_TIMESTAMP ELSE NULL END)
  RETURNING *;
`;

    const values = [
      startDate,
      endDate,
      customerId,
      roomId,
      employeeId,
      bookingId || null,
      paymentAmount ? Number(paymentAmount) : null,
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

app.get("/bookings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        BookingID,
        StartDate,
        EndDate,
        CustomerID,
        RoomID
      FROM Booking
      ORDER BY BookingID
    `);

    res.json({
      success: true,
      bookings: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/customers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM Customer
      ORDER BY CustomerID
    `);

    res.json({
      success: true,
      customers: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/customers", async (req, res) => {
  try {
    const { fullName, address, idType, idNumber } = req.body;

    const result = await pool.query(
      `
      INSERT INTO Customer
      (FullName, Address, IDType, IDNumber)
      VALUES ($1,$2,$3,$4)
      RETURNING *
    `,
      [fullName, address, idType, idNumber],
    );

    res.json({
      success: true,
      customer: result.rows[0],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.put("/customers/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const { fullName, address } = req.body;

    const result = await pool.query(
      `
      UPDATE Customer
      SET FullName=$1,
          Address=$2
      WHERE CustomerID=$3
      RETURNING *
    `,
      [fullName, address, id],
    );

    res.json({
      success: true,
      customer: result.rows[0],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.delete("/customers/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(
      `
      DELETE FROM Customer
      WHERE CustomerID=$1
    `,
      [id],
    );

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/employees", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM Employee
      ORDER BY EmployeeID
    `);

    res.json({
      success: true,
      employees: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/employees", async (req, res) => {
  try {
    const { fullName, address, ssnSin, hotelId } = req.body;

    const result = await pool.query(
      `
      INSERT INTO Employee
      (FullName, Address, SSN_SIN, HotelID)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [fullName, address, ssnSin, hotelId],
    );

    res.json({
      success: true,
      employee: result.rows[0],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.put("/employees/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { fullName, address, hotelId } = req.body;

    const result = await pool.query(
      `
      UPDATE Employee
      SET FullName = $1,
          Address = $2,
          HotelID = $3
      WHERE EmployeeID = $4
      RETURNING *
    `,
      [fullName, address, hotelId, id],
    );

    res.json({
      success: true,
      employee: result.rows[0],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.delete("/employees/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(
      `
      DELETE FROM Employee
      WHERE EmployeeID = $1
    `,
      [id],
    );

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/hotels", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM Hotel
      ORDER BY HotelID
    `);

    res.json({
      success: true,
      hotels: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/hotels", async (req, res) => {
  try {
    const {
      hotelAddress,
      categoryStars,
      numberOfRooms,
      chainId,
      managerEmployeeId,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO Hotel
      (HotelAddress, CategoryStars, NumberOfRooms, ChainID, ManagerEmployeeID)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [
        hotelAddress,
        categoryStars,
        numberOfRooms,
        chainId,
        managerEmployeeId || null,
      ],
    );

    res.json({
      success: true,
      hotel: result.rows[0],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.put("/hotels/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const {
      hotelAddress,
      categoryStars,
      numberOfRooms,
      chainId,
      managerEmployeeId,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE Hotel
      SET HotelAddress = $1,
          CategoryStars = $2,
          NumberOfRooms = $3,
          ChainID = $4,
          ManagerEmployeeID = $5
      WHERE HotelID = $6
      RETURNING *
    `,
      [
        hotelAddress,
        categoryStars,
        numberOfRooms,
        chainId,
        managerEmployeeId || null,
        id,
      ],
    );

    res.json({
      success: true,
      hotel: result.rows[0],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.delete("/hotels/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(
      `
      DELETE FROM Hotel
      WHERE HotelID = $1
    `,
      [id],
    );

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/rooms", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM Room
      ORDER BY RoomID
    `);

    res.json({
      success: true,
      rooms: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/rooms", async (req, res) => {
  try {
    const {
      price,
      capacity,
      viewType,
      extendable,
      problemDamageNotes,
      hotelId,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO Room
      (Price, Capacity, ViewType, Extendable, ProblemDamageNotes, HotelID)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [
        price,
        capacity,
        viewType,
        extendable,
        problemDamageNotes || null,
        hotelId,
      ],
    );

    res.json({
      success: true,
      room: result.rows[0],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.put("/rooms/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const {
      price,
      capacity,
      viewType,
      extendable,
      problemDamageNotes,
      hotelId,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE Room
      SET Price = $1,
          Capacity = $2,
          ViewType = $3,
          Extendable = $4,
          ProblemDamageNotes = $5,
          HotelID = $6
      WHERE RoomID = $7
      RETURNING *
    `,
      [
        price,
        capacity,
        viewType,
        extendable,
        problemDamageNotes || null,
        hotelId,
        id,
      ],
    );

    res.json({
      success: true,
      room: result.rows[0],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.delete("/rooms/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(
      `
      DELETE FROM Room
      WHERE RoomID = $1
    `,
      [id],
    );

    res.json({
      success: true,
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
