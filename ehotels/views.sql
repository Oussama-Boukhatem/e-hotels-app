-- =========================================
-- View 1: Number of available rooms per area
-- =========================================
CREATE OR REPLACE VIEW AvailableRoomsPerArea AS
SELECT
    SUBSTRING(h.HotelAddress FROM '.*, (.*)$') AS Area,
    COUNT(r.RoomID) AS NumberOfAvailableRooms
FROM Room r
JOIN Hotel h ON r.HotelID = h.HotelID
WHERE r.RoomID NOT IN (
    SELECT b.RoomID
    FROM Booking b
    WHERE NOT (b.EndDate <= CURRENT_DATE OR b.StartDate >= CURRENT_DATE)
)
AND r.RoomID NOT IN (
    SELECT rt.RoomID
    FROM Renting rt
    WHERE NOT (rt.EndDate <= CURRENT_DATE OR rt.StartDate >= CURRENT_DATE)
)
GROUP BY SUBSTRING(h.HotelAddress FROM '.*, (.*)$')
ORDER BY Area;


-- =========================================
-- View 2: Aggregated capacity of all rooms of each hotel
-- =========================================
CREATE OR REPLACE VIEW HotelAggregatedCapacity AS
SELECT
    h.HotelID,
    h.HotelAddress,
    SUM(
        CASE r.Capacity
            WHEN 'Single' THEN 1
            WHEN 'Double' THEN 2
            WHEN 'Triple' THEN 3
            WHEN 'Suite' THEN 4
            ELSE 0
        END
    ) AS TotalCapacity
FROM Hotel h
JOIN Room r ON h.HotelID = r.HotelID
GROUP BY h.HotelID, h.HotelAddress
ORDER BY h.HotelID;