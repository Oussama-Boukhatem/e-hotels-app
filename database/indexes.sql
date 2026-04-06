-- Index 1: helps availability checks and overlap trigger on Booking
CREATE INDEX idx_booking_room_dates
ON Booking (RoomID, StartDate, EndDate);

-- Index 2: helps availability checks and overlap trigger on Renting
CREATE INDEX idx_renting_room_dates
ON Renting (RoomID, StartDate, EndDate);

-- Index 3: helps room search/filtering by hotel, capacity, and price
CREATE INDEX idx_room_hotel_capacity_price
ON Room (HotelID, Capacity, Price);