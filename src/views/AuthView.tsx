
import React, { useState } from 'react';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (user: User) => void;
  registeredBarbers: User[];
  onRegisterBarber: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, registeredBarbers, onRegisterBarber }) => {
  const [role, setRole] = useState<'client' | 'barber'>('client');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'barber') {
      if (authMode === 'register') {
        if (!name || !phone || !password) {
          setError('Todos os campos são obrigatórios.');
          return;
        }
        if (registeredBarbers.find(b => b.phone === phone)) {
          setError('Este telefone já possui um cadastro de barbeiro.');
          return;
        }
        const newBarber: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          phone,
          password,
          role: 'barber'
        };
        onRegisterBarber(newBarber);
        onLogin(newBarber);
      } else {
        // Barber Login
        const barber = registeredBarbers.find(b => b.phone === phone && b.password === password);
        if (barber) {
          onLogin(barber);
        } else {
          setError('Credenciais inválidas. Verifique telefone e senha.');
        }
      }
    } else {
      // Client flow (Auto-register/Login on first access)
      if (!name || !phone) {
        setError('Preencha seu nome e telefone.');
        return;
      }
      onLogin({
        id: Math.random().toString(36).substr(2, 9),
        name,
        phone,
        role: 'client'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-amber-500 mb-2">BarberFlow</h1>
          <p className="text-slate-400 text-sm">Agende seu estilo com precisão</p>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-lg mb-6">
          <button 
            onClick={() => { setRole('client'); setAuthMode('register'); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'client' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sou Cliente
          </button>
          <button 
            onClick={() => setRole('barber')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'barber' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sou Barbeiro
          </button>
        </div>

        {role === 'barber' && (
          <div className="flex justify-center gap-4 mb-6">
            <button 
              onClick={() => setAuthMode('login')}
              className={`text-xs font-bold uppercase tracking-widest ${authMode === 'login' ? 'text-amber-500' : 'text-slate-500'}`}
            >
              Entrar
            </button>
            <div className="w-[1px] h-4 bg-slate-800"></div>
            <button 
              onClick={() => setAuthMode('register')}
              className={`text-xs font-bold uppercase tracking-widest ${authMode === 'register' ? 'text-amber-500' : 'text-slate-500'}`}
            >
              Cadastrar
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(role === 'client' || (role === 'barber' && authMode === 'register')) && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                {role === 'barber' ? 'Nome da Barbearia / Seu Nome' : 'Seu Nome'}
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Ex: João Silva"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Telefone / WhatsApp</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="(00) 00000-0000"
            />
          </div>

          {role === 'barber' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Digite sua senha"
              />
            </div>
          )}

          {error && <p className="text-red-400 text-xs text-center font-medium">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-amber-500/10 active:scale-95 mt-4"
          >
            {role === 'client' ? 'Acessar Barbearia' : (authMode === 'register' ? 'Criar Minha Conta' : 'Acessar Painel')}
          </button>
        </form>

        <p className="text-center text-slate-500 text-[10px] mt-8 leading-relaxed">
          {role === 'client' 
            ? 'Ao entrar você concorda com nossos termos. Sua conta é criada no primeiro acesso.' 
            : 'Área exclusiva para profissionais de barbearia gerenciarem seus negócios.'}
        </p>
      </div>
    </div>
  );
};

export default AuthView;
