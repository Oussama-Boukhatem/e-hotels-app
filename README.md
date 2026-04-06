# e-Hotels Management System

## Project Overview

This project implements a relational database and web application for the management of an **e-Hotels platform**. The system allows users to search for available hotel rooms using multiple criteria and perform bookings, while hotel employees can manage rentings, payments, and maintain information about customers, employees, hotels, and rooms.

The project was developed as part of a database systems course and demonstrates the integration of a relational database with a web-based user interface.

---

## Technologies Used

**Database Management System**
- PostgreSQL

**Backend**
- Node.js
- Express.js
- node-postgres (pg)

**Frontend**
- HTML
- CSS
- JavaScript

**Development Tools**
- pgAdmin
- Git / GitHub
- Node.js package manager (npm)

---

## Project Structure


e-hotels-app/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── index.html
│   ├── rooms.html
│   ├── renting.html
│   ├── customers.html
│   ├── employees.html
│   ├── hotels.html
│   ├── rooms-management.html
│   ├── views.html
│   ├── app.js
│   └── style.css
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── queries.sql
│   ├── triggers.sql
│   └── views.sql
│
└── README.md


---

## Database Setup

1. Open **pgAdmin**.
2. Create a new PostgreSQL database (e.g., `ehotels`).
3. Open the **Query Tool**.

Run the SQL files in the following order:

1. `schema.sql`
2. `seed.sql`
3. `triggers.sql`
4. `views.sql`
5. `queries.sql` (optional testing queries)

These scripts will create the database schema, populate sample data, and configure triggers and views.

---

## Backend Setup

Navigate to the backend folder:


cd backend


Install dependencies:


npm install


Create a `.env` file inside the `backend` folder:


DB_HOST=localhost

DB_PORT=5432

DB_NAME=ehotels

DB_USER=your_postgres_user

DB_PASSWORD=your_postgres_password

PORT=3000


Start the backend server:


npm run dev


The server will run at:


http://localhost:3000


---

## Running the Web Application

With the backend server running, open the following URL in a browser:


http://localhost:3000/index.html


The home page provides navigation to all application features.

---

## Application Features

### Room Search and Booking (Customer)
- Search available rooms using:
  - booking dates
  - room capacity
  - hotel area
  - hotel chain
  - hotel category
  - number of rooms in hotel
  - price
- Dynamic search updates when filters change
- Book available rooms

### Employee Operations
- Convert bookings to rentings
- Create direct rentings
- Record payment information

### Management Interfaces
Employees can manage:

- Customers
- Employees
- Hotels
- Rooms

Operations supported:
- Insert
- Delete
- Update

### SQL Views Interface

The interface displays the two required views:

- **AvailableRoomsPerArea**  
  Displays the number of available rooms per area.

- **HotelAggregatedCapacity**  
  Displays the aggregated capacity of rooms per hotel.

---

## Business Logic Enforcement

Triggers enforce business rules including:

- Preventing overlapping bookings for the same room
- Preventing overlapping rentings
- Ensuring consistency between bookings and rentings

---

## Notes

- The application interface allows users to interact with the database without writing SQL queries.
- Payment history is not archived, in accordance with the project requirements.
- All database constraints ensure referential integrity and valid attribute values.