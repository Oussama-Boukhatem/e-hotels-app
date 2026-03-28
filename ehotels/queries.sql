-- =========================================
-- Query 1: Find all available rooms in a given area
-- for a given date range and minimum capacity
-- =========================================
SELECT r.RoomID, r.Price, r.Capacity, r.ViewType, h.HotelAddress, h.CategoryStars
FROM Room r
JOIN Hotel h ON r.HotelID = h.HotelID
WHERE h.HotelAddress ILIKE '%Toronto%'
  AND r.Capacity IN ('Double', 'Triple', 'Suite')
  AND r.RoomID NOT IN (
      SELECT b.RoomID
      FROM Booking b
      WHERE NOT (b.EndDate <= DATE '2026-04-10' OR b.StartDate >= DATE '2026-04-15')
  )
  AND r.RoomID NOT IN (
      SELECT rt.RoomID
      FROM Renting rt
      WHERE NOT (rt.EndDate <= DATE '2026-04-10' OR rt.StartDate >= DATE '2026-04-15')
  );

-- =========================================
-- Query 2: Aggregation query
-- Average room price per hotel chain
-- =========================================
SELECT hc.ChainID, hc.CentralOfficeAddress, ROUND(AVG(r.Price), 2) AS AverageRoomPrice
FROM HotelChain hc
JOIN Hotel h ON hc.ChainID = h.ChainID
JOIN Room r ON h.HotelID = r.HotelID
GROUP BY hc.ChainID, hc.CentralOfficeAddress
ORDER BY hc.ChainID;

-- =========================================
-- Query 3: Nested query
-- Find customers who have made a booking in a 5-star hotel
-- =========================================
SELECT c.CustomerID, c.FullName, c.Address
FROM Customer c
WHERE c.CustomerID IN (
    SELECT b.CustomerID
    FROM Booking b
    JOIN Room r ON b.RoomID = r.RoomID
    JOIN Hotel h ON r.HotelID = h.HotelID
    WHERE h.CategoryStars = 5
);

-- =========================================
-- Query 4: Count how many rooms each hotel has by capacity
-- =========================================
SELECT h.HotelID, h.HotelAddress, r.Capacity, COUNT(*) AS NumberOfRooms
FROM Hotel h
JOIN Room r ON h.HotelID = r.HotelID
GROUP BY h.HotelID, h.HotelAddress, r.Capacity
ORDER BY h.HotelID, r.Capacity;