# bySerkan.de 🚕

A modern food delivery website for bySerkan.de with WhatsApp ordering integration.

## Features

- 📱 Responsive design optimized for mobile and desktop
- 🍕 Complete menu with pizzas, döner, burgers, pasta, and more
- 🛒 Shopping cart with item customization
- 📞 WhatsApp integration for order placement
- ⏰ Real-time opening hours display
- 🚚 Delivery zone management with minimum order requirements
- 🎨 Modern UI with smooth animations
- 🔔 Custom notification sounds for order monitoring
- 📊 Admin dashboard for order management
- 📈 Analytics dashboard with order insights

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime
- **Auth**: Supabase Auth
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd byaliundmesut
npm install
```

### 2. Supabase Configuration

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_EMAILS=admin@example.com
```

### 6. Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 7. Production Build

```bash
npm run build
npm run preview
```

## Menu Management

The menu is defined in `src/data/menuItems.ts` and includes:

- **Spezialitäten**: Döner dishes and specialties
- **Pizza**: Various sizes with customizable toppings
- **Hamburger**: Different patty sizes and toppings
- **Pasta & Al Forno**: Pasta dishes with sauce selection
- **Schnitzel**: Schnitzel variations with sides
- **Finger Food**: Snacks and sides
- **Salate**: Salads with dressing options
- **Desserts**: Sweet treats
- **Getränke**: Beverages with size options
- **Dips**: Various sauces and dips

## Admin Features

### Admin Dashboard
- View all orders in real-time
- Filter orders by status
- Update order status
- View customer details

### Order Monitor
- Real-time order notifications
- Custom notification sounds
- Auto-refresh functionality
- Sound upload for custom alerts

### Analytics Dashboard
- Daily order statistics
- Revenue tracking
- Popular items analysis
- Time-based insights

## Delivery Zones

The application supports multiple delivery zones with individual:
- Minimum order requirements
- Delivery fees
- Zone-specific validation

## Opening Hours

- **Monday, Wednesday, Thursday**: 12:00 - 21:30
- **Friday, Saturday, Sunday & Holidays**: 12:00 - 21:30
- **Tuesday**: Closed (Ruhetag)

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Sound Upload Issues

If you're experiencing issues uploading custom notification sounds:

1. Ensure the file is in WAV format and under 1MB
2. Check browser console for specific error messages

### Supabase Connection Issues

If Supabase is not connecting:

1. Verify all environment variables are set correctly in `.env`
2. Check browser console for specific errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for bySerkan.de.
