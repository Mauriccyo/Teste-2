
export enum AppointmentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  date: string; // ISO string
  time: string; // HH:mm
  status: AppointmentStatus;
}

export interface BusinessHours {
  day: number; // 0-6
  isOpen: boolean;
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'client' | 'barber';
  password?: string; // Added for barbers
}

export interface AppData {
  services: Service[];
  appointments: Appointment[];
  businessHours: BusinessHours[];
  barbers: User[];
}
