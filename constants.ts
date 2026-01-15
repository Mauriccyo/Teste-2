
import { Service, BusinessHours } from './types';

export const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Corte Social', price: 40, durationMinutes: 30 },
  { id: '2', name: 'Degradê / Fade', price: 50, durationMinutes: 45 },
  { id: '3', name: 'Barba Completa', price: 30, durationMinutes: 20 },
  { id: '4', name: 'Combo: Corte + Barba', price: 70, durationMinutes: 60 },
  { id: '5', name: 'Platinado / Nevou', price: 120, durationMinutes: 120 },
];

export const INITIAL_BUSINESS_HOURS: BusinessHours[] = [
  { day: 0, isOpen: false, start: '09:00', end: '18:00' }, // Sunday
  { day: 1, isOpen: true, start: '09:00', end: '19:00' },
  { day: 2, isOpen: true, start: '09:00', end: '19:00' },
  { day: 3, isOpen: true, start: '09:00', end: '19:00' },
  { day: 4, isOpen: true, start: '09:00', end: '19:00' },
  { day: 5, isOpen: true, start: '09:00', end: '20:00' },
  { day: 6, isOpen: true, start: '08:00', end: '18:00' },
];
