

# 📌 URL Shortener - MERN Stack

A full-stack URL shortening application built with the MERN stack (MongoDB, Express.js, React.js, and Node.js). This app allows users to shorten URLs, manage their links, track analytics, and access a user-friendly dashboard.

🚀 Features

1️⃣ URL Shortening

✅ Users can input a long URL and generate a unique shortened version.

✅ Shortened URLs use a random 6-8 character alphanumeric code.

✅ Option to set an expiration date for shortened URLs.

2️⃣ User Management

✅ User Registration & Login (Email & Password-based authentication).

✅ Passwords are securely hashed before storage.

✅ Account Settings:

  Update Profile (Name & Email).
  
  Logout if email is updated.
    
   Delete Account (removes all user data & links).

3️⃣ User Dashboard

✅ Displays a list of all shortened URLs.

✅ Shows details like original URL, short URL, and click analytics.

✅ Users can edit or delete their links.

4️⃣ Click Tracking & Analytics

✅ Track each click's metadata:

    Timestamp
    IP Address
    User Agent (Browser & OS details)
    ✅ Detailed analytics for each link, including:
    Device type (Mobile, Desktop, Tablet)
    Browser details

5️⃣ Link Management

✅ Edit the original URL or alias of a shortened link.
✅ Delete individual shortened links.
6️⃣ Responsive Design

✅ Fully responsive for desktop & mobile devices.
7️⃣ Pagination

✅ Paginated view for managing Links & Analytics.
🎯 Tech Stack

Frontend:

    React.js (Vite)
    React Router
    Tailwind CSS

Backend:

    Node.js
    Express.js
    MongoDB (Mongoose ORM)
    JWT (JSON Web Token) Authentication
    bcrypt.js (Password Hashing)

🔧 Installation & Setup
1️⃣ Clone the Repository

git clone https://github.com/your-username/url-shortener-mern.git
cd url-shortener-mern

2️⃣ Install Dependencies
Backend (Server) Setup

cd server
npm install

Frontend (Client) Setup

cd client
npm install

3️⃣ Environment Variables (.env)

Create a .env file inside the server folder and add:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

▶️ Run the Application
Start Backend Server

cd server
npm start

or

npm run dev  # (for nodemon)

Start Frontend

cd client
npm run dev

App will be available at:

🔗 Frontend: http://localhost:5173
🔗 Backend API: http://localhost:5000
🛠️ Demo Credentials

For testing, you can use the following credentials:

Email: shubham@gmail.com
Password: shubham
