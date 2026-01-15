
import React, { useState, useMemo } from 'react';
import { User, Service, Appointment, BusinessHours, AppointmentStatus } from '../types';

interface ClientDashboardProps {
  currentUser: User;
  appointments: Appointment[];
  services: Service[];
  businessHours: BusinessHours[];
  onAddAppointment: (app: Appointment) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  currentUser, 
  appointments, 
  services, 
  businessHours, 
  onAddAppointment 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showBooking, setShowBooking] = useState(false);

  const myAppointments = useMemo(() => {
    return appointments
      .filter(app => app.clientId === currentUser.id)
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  }, [appointments, currentUser.id]);

  const availableSlots = useMemo(() => {
    const date = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = date.getDay();
    const config = businessHours.find(h => h.day === dayOfWeek);

    if (!config || !config.isOpen) return [];

    const slots: string[] = [];
    let current = new Date(`${selectedDate}T${config.start}`);
    const end = new Date(`${selectedDate}T${config.end}`);

    while (current < end) {
      const timeStr = current.toTimeString().substring(0, 5);
      // Check if slot is taken
      const isTaken = appointments.some(app => 
        app.date === selectedDate && 
        app.time === timeStr && 
        app.status !== AppointmentStatus.CANCELLED
      );
      
      if (!isTaken) {
        slots.push(timeStr);
      }
      current.setMinutes(current.getMinutes() + 30); // 30 min intervals
    }

    return slots;
  }, [selectedDate, businessHours, appointments]);

  const handleBooking = () => {
    if (!selectedServiceId || !selectedTime) return;

    const newApp: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: currentUser.id,
      clientName: currentUser.name,
      clientPhone: currentUser.phone,
      serviceId: selectedServiceId,
      date: selectedDate,
      time: selectedTime,
      status: AppointmentStatus.PENDING
    };

    onAddAppointment(newApp);
    setSelectedServiceId('');
    setSelectedTime('');
    setShowBooking(false);
    alert('Agendamento realizado com sucesso!');
  };

  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-6">
        {/* Services List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Nossos Serviços</h2>
            <button 
              onClick={() => setShowBooking(!showBooking)}
              className="px-4 py-2 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition-colors"
            >
              Agendar Agora
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map(service => (
              <div key={service.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-100">{service.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{service.durationMinutes} minutos</p>
                  </div>
                  <span className="text-amber-500 font-bold">R$ {service.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Form Overlay */}
        {showBooking && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif text-amber-500">Novo Agendamento</h3>
                <button onClick={() => setShowBooking(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">1. Escolha o Dia</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime('');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">2. Selecione o Serviço</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {services.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedServiceId(s.id)}
                        className={`text-left p-3 rounded-lg border transition-all ${selectedServiceId === s.id ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                      >
                        <p className="text-sm font-bold">{s.name}</p>
                        <p className="text-xs opacity-70">R$ {s.price.toFixed(2)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">3. Horários Disponíveis</label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {availableSlots.map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 text-sm font-medium rounded border transition-all ${selectedTime === time ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-red-400 italic">Nenhum horário disponível para este dia ou estabelecimento fechado.</p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-sm">
                    {selectedService && selectedTime && (
                      <p className="text-slate-400">Total: <span className="text-amber-500 font-bold">R$ {selectedService.price.toFixed(2)}</span></p>
                    )}
                  </div>
                  <button
                    disabled={!selectedTime || !selectedServiceId}
                    onClick={handleBooking}
                    className="px-8 py-3 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Confirmar Agendamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-4 space-y-6">
        {/* My Appointments */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Meus Horários
          </h2>
          
          <div className="space-y-3">
            {myAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">Nenhum agendamento encontrado.</p>
              </div>
            ) : (
              myAppointments.map(app => {
                const srv = services.find(s => s.id === app.serviceId);
                const isUpcoming = new Date(`${app.date}T${app.time}`) > new Date();
                
                return (
                  <div key={app.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">{new Date(app.date).toLocaleDateString('pt-BR')} às {app.time}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        app.status === AppointmentStatus.COMPLETED ? 'bg-green-500/20 text-green-500' :
                        app.status === AppointmentStatus.CANCELLED ? 'bg-red-500/20 text-red-500' :
                        'bg-amber-500/20 text-amber-500'
                      }`}>
                        {app.status === AppointmentStatus.PENDING ? (isUpcoming ? 'Marcado' : 'Expirado') : 
                         app.status === AppointmentStatus.COMPLETED ? 'Concluído' : 'Cancelado'}
                      </span>
                    </div>
                    <p className="font-bold text-slate-100">{srv?.name || 'Serviço'}</p>
                    <div className="flex justify-between items-center">
                       <span className="text-xs text-slate-400">R$ {srv?.price.toFixed(2)}</span>
                       {app.status === AppointmentStatus.PENDING && isUpcoming && (
                         <span className="text-[10px] italic text-slate-500">O barbeiro entrará em contato</span>
                       )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Business Status */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6">
          <h3 className="text-amber-500 font-bold mb-2">Avisos Importantes</h3>
          <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4">
            <li>Chegue com 10 minutos de antecedência.</li>
            <li>Cancelamentos devem ser feitos com 1h de aviso.</li>
            <li>Pagamento via PIX, Cartão ou Dinheiro.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
