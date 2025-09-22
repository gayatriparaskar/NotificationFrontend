# Booking Platform Frontend

A modern React frontend application for a booking platform that provides an intuitive interface for users to discover, book, and manage services.

## Features

- **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - Clean and intuitive interface
  - Mobile-first approach
  - Smooth animations and transitions

- **User Authentication**
  - Login and registration forms
  - Protected routes
  - Role-based access control
  - Profile management

- **Service Discovery**
  - Browse services with filtering
  - Search functionality
  - Category-based filtering
  - Price range filtering
  - Service details and reviews

- **Booking System**
  - Real-time availability checking
  - Calendar integration
  - Time slot selection
  - Special requests
  - Booking confirmation

- **Dashboard**
  - User dashboard with statistics
  - Booking management
  - Admin dashboard
  - Profile settings

- **State Management**
  - React Query for server state
  - Context API for global state
  - Optimistic updates
  - Error handling

## Tech Stack

- **Framework**: React 18
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Date Handling**: Moment.js
- **Icons**: Lucide React
- **Notifications**: React Toastify

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NotificationFrontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Project Structure

```
NotificationFrontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.js
│   │   └── ProtectedRoute.js
│   ├── contexts/            # React contexts
│   │   └── AuthContext.js
│   ├── pages/               # Page components
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Services.js
│   │   ├── ServiceDetail.js
│   │   ├── Booking.js
│   │   ├── Dashboard.js
│   │   ├── Bookings.js
│   │   ├── Profile.js
│   │   └── AdminDashboard.js
│   ├── utils/               # Utility functions
│   │   └── api.js
│   ├── App.js               # Main app component
│   ├── index.js             # App entry point
│   └── index.css            # Global styles
├── tailwind.config.js       # Tailwind configuration
└── package.json
```

## Key Components

### Authentication
- **Login/Register Forms**: Clean, validated forms with error handling
- **Protected Routes**: Role-based access control
- **Auth Context**: Global authentication state management

### Service Discovery
- **Services Page**: Grid layout with filtering and search
- **Service Detail**: Detailed service information with booking
- **Filtering**: Category, price range, and search filters

### Booking System
- **Booking Form**: Step-by-step booking process
- **Availability**: Real-time time slot checking
- **Confirmation**: Booking summary and confirmation

### Dashboard
- **User Dashboard**: Personal statistics and quick actions
- **Admin Dashboard**: Platform management and analytics
- **Profile Management**: User settings and preferences

## API Integration

The frontend communicates with the backend through a centralized API client:

```javascript
// Example API usage
import { servicesAPI } from './utils/api';

// Get all services
const { data } = useQuery('services', servicesAPI.getAll);

// Create a booking
const mutation = useMutation(bookingsAPI.create);
```

## State Management

### React Query
- Server state management
- Caching and synchronization
- Background updates
- Optimistic updates

### Context API
- Global authentication state
- User information
- Theme preferences

## Styling

### Tailwind CSS
- Utility-first CSS framework
- Responsive design
- Custom component classes
- Dark mode support (ready)

### Custom Components
- Reusable button styles
- Form input styles
- Card layouts
- Badge components

## Responsive Design

The application is fully responsive with breakpoints:
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

## Error Handling

- Global error boundaries
- API error handling
- User-friendly error messages
- Toast notifications

## Performance Optimizations

- Code splitting with React.lazy
- Image optimization
- Bundle size optimization
- Memoization for expensive operations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Guidelines

### Code Style
- Use functional components with hooks
- Follow React best practices
- Use meaningful variable names
- Add comments for complex logic

### Component Structure
```javascript
// Component template
import React from 'react';

const ComponentName = () => {
  // Hooks
  // Event handlers
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### API Integration
```javascript
// Use React Query for data fetching
const { data, isLoading, error } = useQuery(
  'queryKey',
  () => apiFunction(params),
  {
    enabled: condition,
    staleTime: 5 * 60 * 1000, // 5 minutes
  }
);
```

## Testing

The project is set up with Jest and React Testing Library:

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_ENV`: Environment (development/production)

### Deployment Options
- Netlify
- Vercel
- AWS S3 + CloudFront
- Heroku

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details