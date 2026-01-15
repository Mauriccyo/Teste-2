
import React, { useState, useMemo } from 'react';
import { Appointment, Service, BusinessHours, AppointmentStatus } from '../types';

interface BarberDashboardProps {
  appointments: Appointment[];
  services: Service[];
  businessHours: BusinessHours[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onCancel: (id: string) => void;
  onUpdateServices: (services: Service[]) => void;
  onUpdateHours: (hours: BusinessHours[]) => void;
}

const BarberDashboard: React.FC<BarberDashboardProps> = ({
  appointments,
  services,
  businessHours,
  onUpdateStatus,
  onCancel,
  onUpdateServices,
  onUpdateHours
}) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'services' | 'hours'>('agenda');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Modais
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormData, setServiceFormData] = useState({ name: '', price: 0, durationMinutes: 30 });

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(app => app.date === filterDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, filterDate]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayApps = appointments.filter(a => a.date === today);
    return {
      totalToday: todayApps.length,
      completedToday: todayApps.filter(a => a.status === AppointmentStatus.COMPLETED).length,
      revenueToday: todayApps
        .filter(a => a.status === AppointmentStatus.COMPLETED)
        .reduce((sum, app) => sum + (services.find(s => s.id === app.serviceId)?.price || 0), 0)
    };
  }, [appointments, services]);

  const openServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceFormData({ name: service.name, price: service.price, durationMinutes: service.durationMinutes });
    } else {
      setEditingService(null);
      setServiceFormData({ name: '', price: 0, durationMinutes: 30 });
    }
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      onUpdateServices(services.map(s => s.id === editingService.id ? { ...editingService, ...serviceFormData } : s));
    } else {
      const newService: Service = {
        id: Math.random().toString(36).substr(2, 9),
        ...serviceFormData
      };
      onUpdateServices([...services, newService]);
    }
    setIsServiceModalOpen(false);
  };

  const confirmDeleteService = () => {
    if (serviceToDelete) {
      onUpdateServices(services.filter(s => s.id !== serviceToDelete));
      setServiceToDelete(null);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    onUpdateHours(businessHours.map(h => h.day === dayIndex ? { ...h, isOpen: !h.isOpen } : h));
  };

  const handleTimeChange = (dayIndex: number, field: 'start' | 'end', value: string) => {
    onUpdateHours(businessHours.map(h => h.day === dayIndex ? { ...h, [field]: value } : h));
  };

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Hoje</p>
          <p className="text-2xl font-bold text-amber-500">{stats.totalToday}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Concluídos</p>
          <p className="text-2xl font-bold text-green-500">{stats.completedToday}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Receita Hoje</p>
          <p className="text-2xl font-bold text-slate-100">R$ {stats.revenueToday.toFixed(2)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-center">
           <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full uppercase animate-pulse">Sistema Online</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'agenda', label: 'Agenda Diária' },
          { id: 'services', label: 'Gerenciar Serviços' },
          { id: 'hours', label: 'Expediente' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-4 text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Agenda Tab */}
      {activeTab === 'agenda' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
             <label className="text-sm font-bold text-slate-400">Ver data:</label>
             <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-100 outline-none"
             />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
                <p className="text-slate-500">Nenhum agendamento para este dia.</p>
              </div>
            ) : (
              filteredAppointments.map(app => {
                const srv = services.find(s => s.id === app.serviceId);
                return (
                  <div key={app.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-amber-500/10 rounded-full flex flex-col items-center justify-center border border-amber-500/20">
                        <span className="text-xl font-bold text-amber-500">{app.time}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-slate-100">{app.clientName}</h4>
                        <p className="text-sm text-slate-400">{app.clientPhone}</p>
                        <p className="text-xs text-amber-500 mt-1 font-bold">{srv?.name || 'Serviço Indisponível'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.status === AppointmentStatus.PENDING && (
                        <>
                          <button 
                            onClick={() => onUpdateStatus(app.id, AppointmentStatus.COMPLETED)}
                            className="flex-1 md:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-all"
                          >
                            Concluir
                          </button>
                          <button 
                            onClick={() => onCancel(app.id)}
                            className="flex-1 md:flex-none px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-600/30 rounded-lg text-sm font-bold transition-all"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {app.status === AppointmentStatus.COMPLETED && (
                        <span className="px-4 py-2 bg-green-500/10 text-green-500 font-bold text-sm rounded-lg flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Serviço Concluído
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Gerenciar Serviços e Preços</h3>
            <button 
              className="px-4 py-2 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 text-sm"
              onClick={() => openServiceModal()}
            >
              + Novo Serviço
            </button>
          </div>
          <div className="space-y-3">
            {services.map(srv => (
              <div key={srv.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div>
                  <p className="font-bold">{srv.name}</p>
                  <p className="text-xs text-slate-400">{srv.durationMinutes} min • R$ {srv.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => openServiceModal(srv)} className="text-slate-400 hover:text-white p-2">Editar</button>
                   <button onClick={() => setServiceToDelete(srv.id)} className="text-red-500 hover:text-red-400 p-2">Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hours Tab */}
      {activeTab === 'hours' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
           <h3 className="text-lg font-bold mb-6">Configurar Horário de Atendimento</h3>
           <div className="space-y-4">
             {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((dayName, idx) => {
               const config = businessHours.find(h => h.day === idx);
               return (
                 <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 gap-4">
                   <div className="flex items-center gap-4 min-w-[150px]">
                     <button 
                       onClick={() => handleDayToggle(idx)}
                       className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${config?.isOpen ? 'bg-amber-500' : 'bg-slate-600'}`}
                     >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config?.isOpen ? 'left-7' : 'left-1'}`} />
                     </button>
                     <span className="font-bold">{dayName}</span>
                   </div>
                   
                   {config?.isOpen ? (
                     <div className="flex items-center gap-3">
                       <div className="flex flex-col">
                         <span className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1">Início</span>
                         <input 
                           type="time" 
                           value={config.start} 
                           onChange={(e) => handleTimeChange(idx, 'start', e.target.value)}
                           className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                          />
                       </div>
                       <span className="text-slate-600 mt-5">—</span>
                       <div className="flex flex-col">
                         <span className="text-[10px] text-slate-500 uppercase font-bold ml-1 mb-1">Fim</span>
                         <input 
                           type="time" 
                           value={config.end} 
                           onChange={(e) => handleTimeChange(idx, 'end', e.target.value)}
                           className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                          />
                       </div>
                     </div>
                   ) : (
                     <div className="flex-1 text-right md:text-left">
                       <span className="text-xs text-slate-500 italic bg-slate-900/50 px-3 py-1 rounded-full">Estabelecimento Fechado</span>
                     </div>
                   )}
                 </div>
               );
             })}
           </div>
           <p className="mt-6 text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">As alterações são salvas automaticamente</p>
        </div>
      )}

      {/* Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-serif text-amber-500 mb-6">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h3>
            <form onSubmit={handleSaveService} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome do Serviço</label>
                <input 
                  required
                  type="text" 
                  value={serviceFormData.name}
                  onChange={(e) => setServiceFormData({...serviceFormData, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: Degradê Premium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Preço (R$)</label>
                  <input 
                    required
                    type="number" 
                    value={serviceFormData.price}
                    onChange={(e) => setServiceFormData({...serviceFormData, price: parseFloat(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Duração (Min)</label>
                  <input 
                    required
                    type="number" 
                    value={serviceFormData.durationMinutes}
                    onChange={(e) => setServiceFormData({...serviceFormData, durationMinutes: parseInt(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-100 text-center mb-2">Excluir Serviço?</h3>
            <p className="text-slate-400 text-center text-sm mb-6">Esta ação não pode ser desfeita. O serviço será removido permanentemente da lista.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setServiceToDelete(null)}
                className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteService}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarberDashboard;
