
# Server Status Tracking App

An open-source server status tracking application built with Next.js, Tailwind CSS, and Firebase. This app monitors the status of various web services, displays their real-time status on an interactive world map, and provides detailed uptime statistics.

![App Screenshot](https://repository-images.githubusercontent.com/858516149/1d2a8d23-3a94-4749-b7a8-928db43f4eef)

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Running the App Locally](#running-the-app-locally)
  - [Testing Mode](#testing-mode)
- [Deployment](#deployment)
- [Folder Structure](#folder-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

- **Real-Time Service Monitoring**: Checks the status of predefined web services every 5 minutes.
- **Interactive World Map**: Displays server locations with pulsing icons indicating their status.
- **Detailed Uptime Statistics**: Provides historical downtime events and uptime percentages over 3, 6, and 12 months.
- **Test Mode**: Allows injection of test data to verify calculations and app functionality.
- **Responsive Design**: Styled with Tailwind CSS to look great on all devices.

---

## Demo

[Live Demo](https://your-app.vercel.app/)

---

## Getting Started

### Prerequisites

- **Node.js**: v14.x or higher
- **npm**: v6.x or higher
- **Firebase Account**: For Firestore database
- **Vercel Account**: For deployment (optional)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/server-status-tracking-app.git
   cd server-status-tracking-app
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Firebase**

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable Firestore Database.
   - Obtain your Firebase configuration credentials.

4. **Configure Environment Variables**

   - Create a `.env.local` file in the root directory.
   - Add the following environment variables:

     ```bash
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

     **Note**: Replace the placeholders with your actual Firebase credentials.

---

## Usage

### Running the App Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### Testing Mode

- **Enable Test Mode**: On the main page, click the "Enable Test Mode" button to inject test data into the database.
- **Disable Test Mode**: Click the "Disable Test Mode" button to remove the test data.
- **Verification**: When test mode is enabled, navigate to a server detail page to see if calculations are correct (indicated by a green tick).

---

## Deployment

### Deploying to Vercel

1. **Push Code to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Set Up Vercel Account**

   - Sign up at [Vercel](https://vercel.com/).
   - Import your GitHub repository.

3. **Set Environment Variables on Vercel**

   - Go to your project settings in Vercel.
   - Under "Environment Variables," add the same variables from your `.env.local` file.

4. **Deploy**

   - Vercel will automatically build and deploy your Next.js app.

---

## Folder Structure

```
server-status-tracking-app/
├── app/
│   ├── api/
│   │   ├── check-services/route.js
│   │   ├── service-history/route.js
│   │   ├── service-status/route.js
│   │   └── test-data/route.js
│   ├── [region]/
│   │   └── page.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   ├── Map.js
│   ├── ServerIcon.js
│   └── StatsCard.js
├── lib/
│   └── firebase.js
├── public/
│   └── images/
│       └── screenshot.png
├── config/
│   └── services.json
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.js
└── README.md
```

---

## Technologies Used

- **Next.js 13**: React framework with the `app` directory.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Firebase Firestore**: NoSQL database for storing service statuses.
- **React Simple Maps**: Library for rendering the interactive world map.
- **Vercel**: Hosting platform for deployment.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**

   ```bash
   git clone https://github.com/yourusername/server-status-tracking-app.git
   ```

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add your message here"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **React Simple Maps**: For the interactive world map component.
- **Tailwind CSS**: For making styling efficient and responsive.
- **Firebase**: For providing a robust backend solution.
- **Vercel**: For seamless deployment and hosting.

---

## Detailed Documentation

### API Endpoints

#### `/api/check-services`

- **Method**: `GET`
- **Description**: Checks the status of predefined services and stores any status changes in Firestore.
- **Trigger**: Designed to be called every 5 minutes via AWS Event Bridge.

#### `/api/service-status`

- **Method**: `GET`
- **Description**: Retrieves the current status of each service.

#### `/api/service-history`

- **Method**: `GET`
- **Query Parameters**:
  - `region` (optional): The region for which to retrieve uptime statistics.
- **Description**: Retrieves historical uptime statistics and calculates uptime percentages over 3, 6, and 12 months.

#### `/api/test-data`

- **Method**: `GET`
- **Query Parameters**:
  - `mode`: `inject`, `delete`, or `check`
- **Description**:
  - `inject`: Inserts test downtime events into the database.
  - `delete`: Removes test downtime events.
  - `check`: Checks if test mode is active.

### Configuration

#### Firebase Setup (`lib/firebase.js`)

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ... other Firebase config variables
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
```

#### Services Configuration (`config/services.json`)

Define your services with the following structure:

```json
[
  {
    "name": "Global Login API",
    "url": "https://login-api.example.com/stack",
    "expectedResponse": { "message": "Stack not found" },
    "type": "json",
    "region": "Global"
  },
  {
    "name": "USA Admin API",
    "url": "https://usa.example.com/api/health?appkey=1234",
    "expectedResponseKey": "status",
    "expectedResponseValue": "success",
    "type": "json_key",
    "region": "West Virginia"
  }
  // Add more services as needed
]
```

### Styling with Tailwind CSS

- **Custom Styles**: Defined in `app/globals.css`
- **Theme**: Dark mode with monospaced fonts to mimic the NORAD map from the "Wargames" movie.

---

## Screenshots

### Main Page

![Main Page](public/images/main-page.png)

### Server Detail Page

![Server Detail Page](public/images/server-detail-page.png)

---

## Issues and Feedback

If you encounter any issues or have suggestions, please open an [issue](https://github.com/yourusername/server-status-tracking-app/issues) on GitHub.

---

## Future Enhancements

- **User Authentication**: Restrict access to certain features.
- **Notifications**: Send alerts when a service goes down.
- **Additional Metrics**: Include response times and other performance metrics.
- **Customizable Services**: Allow users to add their own services to monitor.

---

Thank you for using the Server Status Tracking App! We hope it serves your monitoring needs effectively.

For any questions or support, feel free to reach out.

Happy Monitoring! 🚀