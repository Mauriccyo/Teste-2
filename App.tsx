
import React, { useState, useEffect } from 'react';
import { User, Service, Appointment, BusinessHours, AppointmentStatus } from './types';
import { INITIAL_SERVICES, INITIAL_BUSINESS_HOURS } from './constants';
import ClientDashboard from './views/ClientDashboard';
import BarberDashboard from './views/BarberDashboard';
import AuthView from './views/AuthView';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('barber_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [registeredBarbers, setRegisteredBarbers] = useState<User[]>(() => {
    const saved = localStorage.getItem('barber_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('barber_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('barber_appointments');
    return saved ? JSON.parse(saved) : [];
  });

  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(() => {
    const saved = localStorage.getItem('barber_hours');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS_HOURS;
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('barber_user', JSON.stringify(currentUser));
    localStorage.setItem('barber_accounts', JSON.stringify(registeredBarbers));
    localStorage.setItem('barber_services', JSON.stringify(services));
    localStorage.setItem('barber_appointments', JSON.stringify(appointments));
    localStorage.setItem('barber_hours', JSON.stringify(businessHours));
  }, [currentUser, registeredBarbers, services, appointments, businessHours]);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleRegisterBarber = (newBarber: User) => {
    setRegisteredBarbers(prev => [...prev, newBarber]);
  };

  const addAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
  };

  if (!currentUser) {
    return (
      <AuthView 
        onLogin={setCurrentUser} 
        registeredBarbers={registeredBarbers}
        onRegisterBarber={handleRegisterBarber}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <nav className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-serif text-2xl">B</span>
            <span className="font-bold tracking-tight text-xl hidden sm:inline">BarberFlow Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">Olá, {currentUser.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">
                {currentUser.role === 'barber' ? 'Painel Administrativo' : 'Área do Cliente'}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto mt-6 px-4">
        {currentUser.role === 'barber' ? (
          <BarberDashboard 
            appointments={appointments}
            services={services}
            businessHours={businessHours}
            onUpdateStatus={updateAppointmentStatus}
            onCancel={deleteAppointment}
            onUpdateServices={setServices}
            onUpdateHours={setBusinessHours}
          />
        ) : (
          <ClientDashboard 
            currentUser={currentUser}
            appointments={appointments}
            services={services}
            businessHours={businessHours}
            onAddAppointment={addAppointment}
          />
        )}
      </main>
    </div>
  );
};

export default App;
