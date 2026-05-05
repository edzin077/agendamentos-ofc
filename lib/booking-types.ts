export interface Unit {
  id: string
  name: string
  address: string
}

export interface Professional {
  id: string
  name: string
  avatar: string
  specialty: string
}

export interface Service {
  id: string
  name: string
  duration: number
  price: number
  image: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface BookingState {
  step: number
  unit: Unit | null
  professional: Professional | null
  service: Service | null
  date: Date | null
  time: string | null
  customerName: string
  customerPhone: string
}

export const UNITS: Unit[] = [
  { id: "cristais", name: "Cristais", address: "Rua das Flores, 123" },
  { id: "tres-outeiros", name: "Três Outeiros", address: "Av. Principal, 456" },
  { id: "macaubas", name: "Macaúbas", address: "Praça Central, 789" },
]

export const PROFESSIONALS: Professional[] = [
  { 
    id: "maria", 
    name: "Maria", 
    avatar: "/professionals/maria.jpg",
    specialty: "Especialista em Alongamento"
  },
  { 
    id: "fabiana", 
    name: "Fabiana", 
    avatar: "/professionals/fabiana.jpg",
    specialty: "Expert em Nail Art"
  },
]

export const SERVICES: Service[] = [
  { id: "alongamento", name: "Alongamento", duration: 119, price: 130, image: "/services/alongamento.jpg" },
  { id: "banho-gel", name: "Banho em Gel", duration: 119, price: 80, image: "/services/banho-gel.jpg" },
  { id: "esmaltacao-gel", name: "Esmaltação em Gel", duration: 119, price: 50, image: "/services/esmaltacao-gel.jpg" },
  { id: "manicure-pedicure", name: "Manicure e Pedicure", duration: 119, price: 35, image: "/services/manicure-pedicure.jpg" },
  { id: "manutencao-alongamento", name: "Manutenção de Alongamento", duration: 119, price: 80, image: "/services/manutencao-alongamento.jpg" },
  { id: "manutencao-banho-gel", name: "Manutenção de Banho de Gel", duration: 119, price: 60, image: "/services/manutencao-banho-gel.jpg" },
]

export const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const startHour = 8
  const endHour = 20
  
  for (let hour = startHour; hour < endHour; hour += 2) {
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      available: true // Todos horários começam disponíveis, a verificação real é feita no banco de dados
    })
  }
  
  return slots
}
