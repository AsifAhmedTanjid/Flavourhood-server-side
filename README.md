# Flavorhood - Backend

This is the **backend server** for **Flavorhood**, a food review platform where users can add, manage, and explore reviews for various dishes and restaurants.  
Built with **Node.js**, **Express**, **MongoDB**, and **Firebase Admin SDK** for authentication.

## Key Features
- **User Management:** Add, edit, delete, and fetch users from MongoDB.  
- **Reviews CRUD:** Users can create, update, delete, and fetch reviews.  
- **Authentication & Authorization:** Firebase Authentication token verification for secure endpoints.  
- **Favorites System:** Users can favorite reviews and manage their favorites list.  
- **Search Functionality:** Search reviews by food name using MongoDB regex queries.  

Additional Features:  
- Featured reviews endpoint (top-rated dishes)  
- Sorted results for reviews and favorites    

## Tech Stack
- **Backend:** Node.js, Express  
- **Database:** MongoDB  
- **Authentication:** Firebase Admin SDK  
- **Other Libraries:** dotenv, cors, mongodb  

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/flavorhood-server-side.git
cd flavorhood-server-side

# Install dependencies
npm install

# Add .env file based on .env.example

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
