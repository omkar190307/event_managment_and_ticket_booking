# event_managment_and_ticket_booking

## Description
This project is a comprehensive event management and ticket booking system that allows users to register, log in, browse events, and purchase tickets. It provides functionalities for both users and administrators to manage events, orders, and user profiles.

## Features
- User registration and authentication
- Event browsing with detailed information
- Ticket purchasing and order management
- Admin functionalities for managing events, speakers, and orders

## Tech Stack
- Language: JavaScript
- Framework: Express.js (Node.js)
- Database: MySQL
- Tools: npm, bcryptjs, jsonwebtoken

## Project Structure
```
backend/
├── routes/
│   ├── events.js
│   ├── orders.js
│   ├── speakers.js
│   ├── users.js
│   ├── payments.js
│   └── tickets.js
│   └── venues.js
├── package-lock.json
├── server.js
└── db.js
database/
├── update.sql
└── schema.sql
frontend/
├── css/
│   ├── events.css
│   ├── main.css
│   ├── auth.css
│   └── home.css
├── images/
│   ├── startup.png
│   ├── dbms.png
│   ├── leadership.png
│   ├── cloud.png
│   └── techfest.png
├── js/
│   ├── auth.js
│   ├── events.js
│   ├── event-detail.js
│   ├── utils.js
│   ├── main.js
│   └── dashboard.js
└── pages/
    ├── event-detail.html
    ├── checkout.html
    ├── events.html
    ├── login.html
    ├── dashboard.html
    ├── index.html
    ├── venues.html
    ├── register.html
    └── speakers.html
```

## Installation
1. Clone Repository: `git clone <repository_url>`
2. Install Dependencies: `npm install`
3. Run Project: `node backend/server.js`

## Usage
To use the application, start the server and navigate to the frontend pages in your web browser. Users can register, log in, view events, and purchase tickets.

## Screenshots
![Screenshot](assets/screenshots/dashboard.png)

## Demo
[Watch Demo](assets/demo.gif)

## Future Improvements
- Implement user roles and permissions for enhanced security
- Add payment gateway integration for ticket purchases
- Enhance the user interface for better user experience
- Implement real-time notifications for event updates

## Author
omkar biradar

## License
MIT License