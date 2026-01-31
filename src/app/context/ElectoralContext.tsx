import React, { createContext, useContext, useState, ReactNode } from 'react';

// Tipos
export interface Candidato {
  id: string;
  nombre: string;
  partido: string;
  numero: number;
  logo?: string;
  color?: string;
}

export interface Provincia {
  id: string;
  nombre: string;
}

export interface Distrito {
  id: string;
  provinciaId: string;
  nombre: string;
}

export interface Mesa {
  id: string;
  numero: string;
  local: string;
  departamento: string;
  provincia: string;
  distrito: string;
  totalVotantes: number;
}

export interface Personero {
  id: string;
  nombre: string;
  dni: string;
  mesaId?: string;
  password: string;
}

export interface VotosPorCandidato {
  [candidatoId: string]: number;
}

export interface Acta {
  id: string;
  mesaId: string;
  totalVotantes: number;
  votosBlancos: number;
  votosNulos: number;
  votosImpugnados: number;
  votosPorCandidato: VotosPorCandidato;
  imagenUrl?: string;
  estado: 'Enviada' | 'Observada' | 'Validada';
  fechaEnvio: Date;
  ipAddress: string;
}

interface ElectoralContextType {
  // Candidatos
  candidatos: Candidato[];
  agregarCandidato: (candidato: Omit<Candidato, 'id'>) => void;
  editarCandidato: (id: string, candidato: Omit<Candidato, 'id'>) => void;
  eliminarCandidato: (id: string) => void;

  // Mesas
  mesas: Mesa[];
  agregarMesa: (mesa: Omit<Mesa, 'id'>) => void;
  editarMesa: (id: string, mesa: Omit<Mesa, 'id'>) => void;
  eliminarMesa: (id: string) => void;

  // Personeros
  personeros: Personero[];
  agregarPersonero: (personero: Omit<Personero, 'id' | 'mesaId'>) => void;
  editarPersonero: (id: string, personero: Omit<Personero, 'id' | 'mesaId'>) => void;
  eliminarPersonero: (id: string) => void;
  asignarMesa: (personeroId: string, mesaId: string | undefined) => void;

  // Actas
  actas: Acta[];
  registrarActa: (acta: Omit<Acta, 'id' | 'fechaEnvio' | 'ipAddress'>) => void;
  cambiarEstadoActa: (id: string, estado: Acta['estado']) => void;

  // Ubigeo
  provincias: Provincia[];
  distritos: Distrito[];

  // Usuario actual
  usuarioActual: {
    id: string;
    nombre: string;
    rol: 'admin' | 'personero';
    mesaId?: string;
  } | null;
  login: (dni: string, password: string) => boolean;
  logout: () => void;
}

const ElectoralContext = createContext<ElectoralContextType | undefined>(undefined);

// Datos iniciales - Sistema Electoral de la Provincia de Sechura (Piura)
const provinciasIniciales: Provincia[] = [
  { id: 'prov-8', nombre: 'Sechura' },
];

const distritosIniciales: Distrito[] = [
  // Provincia Sechura - Distritos Oficiales con UBIGEO
  { id: 'dist-31', provinciaId: 'prov-8', nombre: 'Sechura' },
  { id: 'dist-32', provinciaId: 'prov-8', nombre: 'Bellavista de la Unión' },
  { id: 'dist-33', provinciaId: 'prov-8', nombre: 'Bernal' },
  { id: 'dist-34', provinciaId: 'prov-8', nombre: 'Cristo Nos Valga' },
  { id: 'dist-35', provinciaId: 'prov-8', nombre: 'Rinconada Llicuar' },
  { id: 'dist-36', provinciaId: 'prov-8', nombre: 'Vice' },
];

const candidatosIniciales: Candidato[] = [
  { id: '1', nombre: 'Alexis Payba Benites', partido: 'APRA', numero: 1, color: '#E63946', logo: '' },
  { id: '2', nombre: 'Boris Alexander Montaño Tume', partido: 'Alianza para el Progreso', numero: 2, color: '#457B9D', logo: '' },
  { id: '3', nombre: 'Henry Zavaleta Amaya', partido: 'Nuevo Perú', numero: 3, color: '#F77F00', logo: '' },
  { id: '4', nombre: 'José Bernardo Pazos Nunura', partido: 'Somos Perú', numero: 4, color: '#06A77D', logo: '' },
  { id: '5', nombre: 'Justo Eche Morales', partido: 'Alianza para el Progreso', numero: 5, color: '#457B9D', logo: '' },
  { id: '6', nombre: 'Santos Querevalú', partido: 'Podemos Perú', numero: 6, color: '#D62828', logo: '' },
  { id: '7', nombre: 'Armando Arévalo Zeta', partido: 'Perú Libre', numero: 7, color: '#9D4EDD', logo: '' },
];

const mesasIniciales: Mesa[] = [
  { id: 'm1', numero: '000123', local: 'I.E. San Miguel', departamento: 'Piura', provincia: 'Sechura', distrito: 'Sechura', totalVotantes: 300 },
  { id: 'm2', numero: '000124', local: 'I.E. Los Andes', departamento: 'Piura', provincia: 'Sechura', distrito: 'Sechura', totalVotantes: 280 },
  { id: 'm3', numero: '000125', local: 'Colegio Nacional', departamento: 'Piura', provincia: 'Sechura', distrito: 'Bellavista de la Unión', totalVotantes: 320 },
  { id: 'm4', numero: '000126', local: 'Centro Educativo Bernal', departamento: 'Piura', provincia: 'Sechura', distrito: 'Bernal', totalVotantes: 350 },
  { id: 'm5', numero: '000127', local: 'I.E. Cristo Nos Valga', departamento: 'Piura', provincia: 'Sechura', distrito: 'Cristo Nos Valga', totalVotantes: 290 },
  { id: 'm6', numero: '000128', local: 'I.E. Rinconada', departamento: 'Piura', provincia: 'Sechura', distrito: 'Rinconada Llicuar', totalVotantes: 275 },
  { id: 'm7', numero: '000129', local: 'Colegio Vice', departamento: 'Piura', provincia: 'Sechura', distrito: 'Vice', totalVotantes: 310 },
];

const personerosIniciales: Personero[] = [
  { id: 'p1', nombre: 'Pedro Martínez', dni: '12345678', mesaId: 'm1', password: '1234' },
  { id: 'p2', nombre: 'Ana Flores', dni: '23456789', mesaId: 'm2', password: '1234' },
  { id: 'p3', nombre: 'Luis Sánchez', dni: '34567890', mesaId: 'm3', password: '1234' },
  { id: 'p4', nombre: 'Carmen Torres', dni: '45678901', mesaId: 'm4', password: '1234' },
  { id: 'p5', nombre: 'Roberto Díaz', dni: '56789012', mesaId: 'm5', password: '1234' },
  { id: 'p6', nombre: 'Juan Cabanillas Morales', dni: '87654321', mesaId: 'm6', password: 'segura123' },
  { id: 'p7', nombre: 'María Salazar Gutierrez', dni: '98765432', mesaId: 'm7', password: 'abc12345' },
];

const actasIniciales: Acta[] = [
  {
    id: 'a1',
    mesaId: 'm1',
    totalVotantes: 300,
    votosBlancos: 10,
    votosNulos: 5,
    votosImpugnados: 3,
    votosPorCandidato: { '1': 85, '2': 65, '3': 45, '4': 55, '5': 20, '6': 12, '7': 0 },
    estado: 'Validada',
    fechaEnvio: new Date('2026-01-31T10:30:00'),
    ipAddress: '192.168.1.101',
  },
  {
    id: 'a2',
    mesaId: 'm2',
    totalVotantes: 280,
    votosBlancos: 8,
    votosNulos: 4,
    votosImpugnados: 2,
    votosPorCandidato: { '1': 75, '2': 58, '3': 40, '4': 50, '5': 18, '6': 15, '7': 10 },
    estado: 'Enviada',
    fechaEnvio: new Date('2026-01-31T11:15:00'),
    ipAddress: '192.168.1.102',
  },
  {
    id: 'a3',
    mesaId: 'm3',
    totalVotantes: 320,
    votosBlancos: 12,
    votosNulos: 6,
    votosImpugnados: 4,
    votosPorCandidato: { '1': 95, '2': 72, '3': 50, '4': 60, '5': 22, '6': 14, '7': 5 },
    estado: 'Validada',
    fechaEnvio: new Date('2026-01-31T12:00:00'),
    ipAddress: '192.168.1.103',
  },
];

export function ElectoralProvider({ children }: { children: ReactNode }) {
  const [candidatos, setCandidatos] = useState<Candidato[]>(candidatosIniciales);
  const [mesas, setMesas] = useState<Mesa[]>(mesasIniciales);
  const [personeros, setPersoneros] = useState<Personero[]>(personerosIniciales);
  const [actas, setActas] = useState<Acta[]>(actasIniciales);
  const [usuarioActual, setUsuarioActual] = useState<ElectoralContextType['usuarioActual']>(null);

  const agregarCandidato = (candidato: Omit<Candidato, 'id'>) => {
    const newId = (Math.max(0, ...candidatos.map(c => parseInt(c.id))) + 1).toString();
    setCandidatos([...candidatos, { ...candidato, id: newId }]);
  };

  const editarCandidato = (id: string, candidato: Omit<Candidato, 'id'>) => {
    setCandidatos(candidatos.map(c => c.id === id ? { ...candidato, id } : c));
  };

  const eliminarCandidato = (id: string) => {
    setCandidatos(candidatos.filter(c => c.id !== id));
  };

  const agregarMesa = (mesa: Omit<Mesa, 'id'>) => {
    const newId = `m${Date.now()}`;
    setMesas([...mesas, { ...mesa, id: newId }]);
  };

  const editarMesa = (id: string, mesa: Omit<Mesa, 'id'>) => {
    setMesas(mesas.map(m => m.id === id ? { ...mesa, id } : m));
  };

  const eliminarMesa = (id: string) => {
    setMesas(mesas.filter(m => m.id !== id));
  };

  const agregarPersonero = (personero: Omit<Personero, 'id' | 'mesaId'>) => {
    const newId = `p${Date.now()}`;
    setPersoneros([...personeros, { ...personero, id: newId }]);
  };

  const editarPersonero = (id: string, personero: Omit<Personero, 'id' | 'mesaId'>) => {
    setPersoneros(personeros.map(p => {
      if (p.id === id) {
        return { ...personero, id, mesaId: p.mesaId };
      }
      return p;
    }));
  };

  const eliminarPersonero = (id: string) => {
    setPersoneros(personeros.filter(p => p.id !== id));
  };

  const asignarMesa = (personeroId: string, mesaId: string | undefined) => {
    setPersoneros(personeros.map(p => 
      p.id === personeroId ? { ...p, mesaId } : p
    ));
  };

  const registrarActa = (acta: Omit<Acta, 'id' | 'fechaEnvio' | 'ipAddress'>) => {
    const newActa: Acta = {
      ...acta,
      id: `a${Date.now()}`,
      fechaEnvio: new Date(),
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      estado: 'Enviada',
    };
    setActas([...actas, newActa]);
  };

  const cambiarEstadoActa = (id: string, estado: Acta['estado']) => {
    setActas(actas.map(a => a.id === id ? { ...a, estado } : a));
  };

  const login = (dni: string, password: string): boolean => {
    // Normalizar entrada (trim)
    const dniTrimmed = dni.trim().toLowerCase();
    const passwordTrimmed = password.trim();

    // Admin login
    if (dniTrimmed === 'admin' && passwordTrimmed === 'admin') {
      setUsuarioActual({
        id: '87654321',
        nombre: 'Administrador del Sistema',
        rol: 'admin',
      });
      return true;
    }

    // Admin adicional
    if (dniTrimmed === 'admin2' && passwordTrimmed === 'admin@2025') {
      setUsuarioActual({
        id: '11111111',
        nombre: 'Administrador Supervisor',
        rol: 'admin',
      });
      return true;
    }

    // Personero login
    const personero = personeros.find(p => p.dni === dni.trim() && p.password === passwordTrimmed);
    if (personero) {
      setUsuarioActual({
        id: personero.id,
        nombre: personero.nombre,
        rol: 'personero',
        mesaId: personero.mesaId,
      });
      return true;
    }

    return false;
  };

  const logout = () => {
    setUsuarioActual(null);
  };

  return (
    <ElectoralContext.Provider
      value={{
        candidatos,
        agregarCandidato,
        editarCandidato,
        eliminarCandidato,
        mesas,
        agregarMesa,
        editarMesa,
        eliminarMesa,
        personeros,
        agregarPersonero,
        editarPersonero,
        eliminarPersonero,
        asignarMesa,
        actas,
        registrarActa,
        cambiarEstadoActa,
        provincias: provinciasIniciales,
        distritos: distritosIniciales,
        usuarioActual,
        login,
        logout,
      }}
    >
      {children}
    </ElectoralContext.Provider>
  );
}

export function useElectoral() {
  const context = useContext(ElectoralContext);
  if (!context) {
    throw new Error('useElectoral debe ser usado dentro de ElectoralProvider');
  }
  return context;
}
