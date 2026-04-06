-- =========================================
-- Trigger 1: Prevent overlapping bookings
-- for the same room
-- =========================================

CREATE OR REPLACE FUNCTION prevent_overlapping_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM Booking b
        WHERE b.RoomID = NEW.RoomID
          AND b.BookingID <> COALESCE(NEW.BookingID, -1)
          AND NOT (b.EndDate <= NEW.StartDate OR b.StartDate >= NEW.EndDate)
    ) THEN
        RAISE EXCEPTION 'Booking conflict: this room is already booked during the selected dates.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM Renting r
        WHERE r.RoomID = NEW.RoomID
          AND NOT (r.EndDate <= NEW.StartDate OR r.StartDate >= NEW.EndDate)
    ) THEN
        RAISE EXCEPTION 'Booking conflict: this room is already being rented during the selected dates.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_overlapping_booking
BEFORE INSERT OR UPDATE ON Booking
FOR EACH ROW
EXECUTE FUNCTION prevent_overlapping_booking();


-- =========================================
-- Trigger 2: Prevent overlapping rentings
-- for the same room
-- =========================================

CREATE OR REPLACE FUNCTION prevent_overlapping_renting()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM Renting r
        WHERE r.RoomID = NEW.RoomID
          AND r.RentingID <> COALESCE(NEW.RentingID, -1)
          AND NOT (r.EndDate <= NEW.StartDate OR r.StartDate >= NEW.EndDate)
    ) THEN
        RAISE EXCEPTION 'Renting conflict: this room is already rented during the selected dates.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM Booking b
        WHERE b.RoomID = NEW.RoomID
          AND NOT (b.EndDate <= NEW.StartDate OR b.StartDate >= NEW.EndDate)
          AND (NEW.BookingID IS NULL OR b.BookingID <> NEW.BookingID)
    ) THEN
        RAISE EXCEPTION 'Renting conflict: this room is already booked during the selected dates.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_overlapping_renting
BEFORE INSERT OR UPDATE ON Renting
FOR EACH ROW
EXECUTE FUNCTION prevent_overlapping_renting();