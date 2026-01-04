# Flavorhood - Backend

This is the **backend server** for **Flavorhood**, a food review platform where users can add, manage, and explore reviews for various dishes and restaurants.  
Built with **Node.js**, **Express**, **MongoDB**, and **Firebase Admin SDK** for authentication.

## Key Features
- **User Management:** 
    - Add, fetch, and delete users.
    - Role-based access control (Admin/User).
    - Admin verification middleware.
- **Reviews CRUD:** 
    - Create, read, update, and delete reviews.
    - Pagination, Sorting, and Filtering support.
- **Authentication & Authorization:** 
    - Firebase Authentication token verification.
    - Secure endpoints protected by `verifyToken` and `verifyAdmin` middleware.
- **Favorites System:** Users can favorite reviews and manage their favorites list.  
- **Search Functionality:** Search reviews by food name using MongoDB regex queries.  

Additional Features:  
- Featured reviews endpoint (top-rated dishes).
- Admin stats and management endpoints.

## Tech Stack
- **Backend:** Node.js, Express  
- **Database:** MongoDB  
- **Authentication:** Firebase Admin SDK  
- **Other Libraries:** dotenv, cors, mongodb  

## Installation

```bash
# Clone the repository
git clone https://github.com/AsifAhmedTanjid/flavorhood-server-side.git
cd flavorhood-server-side

# Install dependencies
npm install

# Start the server
node index.js
```

## Dependencies

```json
{
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^5.1.0",
  "firebase-admin": "^13.6.0",
  "mongodb": "^7.0.0"
}
```

## 👨‍💻 Author

**Asif Ahmed Tanjid**
- GitHub: [@AsifAhmedTanjid](https://github.com/AsifAhmedTanjid)
