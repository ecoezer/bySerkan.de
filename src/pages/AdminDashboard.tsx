import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  ShoppingBag,
  Menu as MenuIcon,
  BarChart3,
  Settings,
  UserCog
} from 'lucide-react';
import { signOut } from '../services/authService';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const menuItems = [
    {
      title: 'Bestellungen',
      description: 'Eingehende Bestellungen ansehen und verwalten',
      icon: ShoppingBag,
      path: '/admin/orders',
      color: 'bg-blue-500'
    },
    {
      title: 'Speisekarte',
      description: 'Kategorien und Gerichte bearbeiten',
      icon: MenuIcon,
      path: '/admin/menu',
      color: 'bg-green-500'
    },
    {
      title: 'Analysen',
      description: 'Umsätze und Statistiken einsehen',
      icon: BarChart3,
      path: '/admin/analytics',
      color: 'bg-orange-500'
    },
    {
      title: 'Einstellungen',
      description: 'Öffnungszeiten und Shop-Status verwalten',
      icon: Settings,
      path: '/admin/settings',
      color: 'bg-gray-500'
    },
    {
      title: 'Admin-Einstellungen',
      description: 'Passwort ändern und Account verwalten',
      icon: UserCog,
      path: '/admin/profile',
      color: 'bg-indigo-500'
    }
  ];


  return (
    <div className="min-h-screen bg-[#1a2332]">
      <header className="bg-[#1a2332] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 text-sm">Willkommen im Verwaltungsbereich</p>
            </div>
            <div className="flex gap-3">

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="group bg-[#2a3648] hover:bg-[#324056] p-8 rounded-xl transition-all duration-200 text-left border border-gray-700 hover:border-gray-500 shadow-lg hover:shadow-xl flex items-start gap-6"
            >
              <div className={`p-4 rounded-xl ${item.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-200`}>
                <item.icon className={`w-8 h-8 ${item.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
