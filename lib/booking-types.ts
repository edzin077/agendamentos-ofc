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
  allowedUnits: string[] // IDs das unidades onde este profissional trabalha
  allowedServices: string[] // IDs dos serviços que este profissional oferece
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
  { id: "cristais", name: "Cristais", address: "" },
  { id: "tres-outeiros", name: "Três Outeiros", address: "" },
  { id: "macaubas", name: "Macaúbas", address: "" },
]

export const PROFESSIONALS: Professional[] = [
  { 
    id: "maria", 
    name: "Maria", 
    avatar: "/professionals/maria.jpg",
    specialty: "Especialista em Alongamento",
    allowedUnits: ["cristais", "tres-outeiros", "macaubas"], // Todas as unidades
    allowedServices: ["alongamento", "banho-gel", "esmaltacao-gel", "manicure-pedicure", "manutencao-alongamento", "manutencao-banho-gel"] // Todos os serviços
  },
  { 
    id: "fabiana", 
    name: "Fabiana", 
    avatar: "/professionals/fabiana.jpg",
    specialty: "Manicure e Pedicure",
    allowedUnits: ["cristais"], // Apenas Cristais
    allowedServices: ["manicure-pedicure"] // Apenas Manicure e Pedicure
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
