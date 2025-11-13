# Food Cycle Backend

A Node.js backend application for a food sharing platform that connects food donors with people in need. This API enables users to share surplus food, request food items, and manage food donations effectively.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Usage](#-usage)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **Food Donation Management**: Users can add, update, and delete food donations
- **Food Requests**: Users can request food items from available donations
- **Request Management**: Donors can accept or reject food requests
- **User-Specific Data**: Users can view their own food donations
- **Data Validation**: Field-level validation to prevent unauthorized data changes
- **Security**: Protected endpoints with proper validation

## 🛠️ Tech Stack

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for storing food and user data
- **CORS**: Cross-Origin Resource Sharing
- **dotenv**: Environment variable management
- **Vercel**: Deployment platform

## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Food-Cycle-Backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Variables](#-environment-variables))

4. **Start the development server**:
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000` by default.

## 🔐 Environment Variables

Create a `.env` file in the root directory and add the following:

```env
DB_USER=<your_mongodb_username>
DB_PASS=<your_mongodb_password>
DB_CLUSTER=<your_mongodb_cluster_name>
PORT=3000
```

You can refer to `.env.example` for the required format.

## 📡 API Endpoints

### Food Management

- **GET** `/` - Health check endpoint
- **GET** `/foods` - Get all available food items
- **GET** `/foods/:id` - Get a specific food item
- **GET** `/my-foods?email=user@example.com` - Get all food items for a specific user
- **POST** `/foods` - Add a new food item
- **PATCH** `/foods/:id` - Update a food item
- **DELETE** `/foods/:id` - Remove a food item

### Food Requests

- **GET** `/foodRequest/:id` - Get all requests for a specific food item
- **POST** `/foodRequest/:id` - Submit a request for a food item
- **PATCH** `/foodRequestAccept/:id` - Accept a food request
- **PATCH** `/foodRequestReject/:id` - Reject a food request

## 📥 Food Item Data Structure

When adding or updating food items, the following fields are allowed:

- `user_name`: Donor's name
- `email`: Donor's email (used for retrieval)
- `available_status`: Boolean indicating if food is available
- `user_img_url`: URL to donor's image
- `food_name`: Name of the food item
- `food_image`: URL to food image
- `food_quantity`: Quantity of food
- `pickup_location`: Location for pickup
- `expire_date`: Expiration date of food
- `additional_notes`: Any additional notes

## 📥 Food Request Data Structure

When submitting food requests, the following fields are allowed:

- `writeLocation`: Requester's location
- `whyNeedFood`: Reason for needing food
- `contactNo`: Requester's contact number
- `userEmail`: Requester's email
- `name`: Requester's name
- `photoURL`: Requester's photo URL

## 🌐 Deployment

This application is configured for deployment on Vercel. The `vercel.json` file is already set up for Node.js deployment.

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Contact

Project Link: [https://github.com/your-username/Food-Cycle-Backend](https://github.com/your-username/Food-Cycle-Backend)

---

Built with ❤️ for reducing food waste and helping communities.