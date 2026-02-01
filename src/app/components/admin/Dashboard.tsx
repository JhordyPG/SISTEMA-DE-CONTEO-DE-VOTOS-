import React, { useState, useMemo } from 'react';
import { useElectoral } from '@/app/context/ElectoralContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Layer } from 'recharts';
import { FileText, CheckCircle, TrendingUp, MapPin } from 'lucide-react';

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FileText, CheckCircle, TrendingUp, MapPin } from 'lucide-react';

/* ======================================================
   CHART SEGURO PARA MOBILE + DESKTOP (CON LOGOS)
====================================================== */
const BarChartWithLogos = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-slate-500 py-10">Sin datos</p>;
  }

  return (
    <div className="relative w-full h-[500px]">
      {/* LOGOS (HTML, NO SVG) */}
      <div className="absolute top-0 left-0 w-full flex justify-around z-10 pointer-events-none">
        {data.map((c) => (
          <div
            key={c.numero}
            className="flex flex-col items-center"
            style={{ width: `${100 / data.length}%` }}
          >
            {c.logo && (
              <img
                src={c.logo}
                alt={c.nombre}
                className="w-10 h-10 object-contain mb-1"
              />
            )}
            <span className="text-xs font-semibold text-slate-600">
              {c.numero}
            </span>
          </div>
        ))}
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 80, right: 20, left: 0, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="partido"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip formatter={(v: number) => [`${v} votos`, 'Votos']} />
          <Bar
            dataKey="votos"
            radius={[8, 8, 0, 0]}
            isAnimationActive={false} // 🔑 CLAVE
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || '#94A3B8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


export function Dashboard() {
  try {
    const { candidatos, mesas, actas, provincias, distritos } = useElectoral();

    const [selectedProvincia, setSelectedProvincia] = useState<string>('all');
    const [selectedDistrito, setSelectedDistrito] = useState<string>('all');
    const [selectedLocal, setSelectedLocal] = useState<string>('all');
    const [selectedMesa, setSelectedMesa] = useState<string>('all');

    // Filtrar datos
    const mesasFiltradas = useMemo(() => {
      return mesas.filter(mesa => {
        if (selectedProvincia && selectedProvincia !== 'all' && mesa.provincia !== selectedProvincia) return false;
        if (selectedDistrito && selectedDistrito !== 'all' && mesa.distrito !== selectedDistrito) return false;
        if (selectedLocal && selectedLocal !== 'all' && mesa.local !== selectedLocal) return false;
        if (selectedMesa && selectedMesa !== 'all' && mesa.numero !== selectedMesa) return false;
        return true;
      });
    }, [mesas, selectedProvincia, selectedDistrito, selectedLocal, selectedMesa]);

    const actasFiltradas = useMemo(() => {
      const mesasIds = new Set(mesasFiltradas.map(m => m.id));
      return actas.filter(acta => mesasIds.has(acta.mesaId));
    }, [actas, mesasFiltradas]);

    // Calcular KPIs
    const totalMesas = mesasFiltradas.length;
    const mesasRegistradas = actasFiltradas.length;
    const porcentajeAvance = totalMesas > 0 ? (mesasRegistradas / totalMesas) * 100 : 0;

    // Calcular votos por candidato con colores y logos
    const votosPorCandidato = useMemo(() => {
      const votos: { [key: string]: number } = {};
      candidatos.forEach(c => votos[c.id] = 0);

      actasFiltradas.forEach(acta => {
        Object.entries(acta.votosPorCandidato).forEach(([candidatoId, cantidad]) => {
          if (votos[candidatoId] !== undefined) {
            votos[candidatoId] += cantidad;
          }
        });
      });

      return candidatos.map(c => ({
        nombre: c.nombre,
        partido: c.partido,
        numero: c.numero,
        votos: votos[c.id] || 0,
        color: c.color || '#94A3B8',
        logo: c.logo || '',
      })).sort((a, b) => b.votos - a.votos);
    }, [candidatos, actasFiltradas]);

    // Calcular votos especiales
    const votosEspeciales = useMemo(() => {
      let blancos = 0;
      let nulos = 0;
      let impugnados = 0;

      actasFiltradas.forEach(acta => {
        blancos += acta.votosBlancos;
        nulos += acta.votosNulos;
        impugnados += acta.votosImpugnados;
      });

      return { blancos, nulos, impugnados };
    }, [actasFiltradas]);

    const totalVotos = votosPorCandidato.reduce((sum, c) => sum + c.votos, 0);
    const totalVotosEspeciales = votosEspeciales.blancos + votosEspeciales.nulos + votosEspeciales.impugnados;
    const sumaTotal = totalVotos + totalVotosEspeciales;

    // Calcular porcentaje de validez
    const porcentajeValidez = sumaTotal > 0 ? ((totalVotos / sumaTotal) * 100).toFixed(1) : '0';

    const dataPie = votosPorCandidato.map(c => ({
      name: `${c.numero}. ${c.nombre}`,
      value: c.votos,
    }));

    const dataVotosEspeciales = [
      { name: 'Votos Válidos', value: totalVotos, fill: '#3B82F6' },
      { name: 'Votos Blancos', value: votosEspeciales.blancos, fill: '#10B981' },
      { name: 'Votos Nulos', value: votosEspeciales.nulos, fill: '#F59E0B' },
      { name: 'Votos Impugnados', value: votosEspeciales.impugnados, fill: '#EF4444' },
    ];

    const distritosDisponibles = useMemo(() => {
      if (!selectedProvincia || selectedProvincia === 'all') return [];
      return distritos.filter(d => {
        const provincia = provincias.find(p => p.nombre === selectedProvincia);
        return provincia && d.provinciaId === provincia.id;
      });
    }, [selectedProvincia, distritos, provincias]);

    const localesDisponibles = useMemo(() => {
      return [...new Set(mesasFiltradas.map(m => m.local))];
    }, [mesasFiltradas]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Electoral</h1>
        <p className="text-slate-600 mt-1">Visualización en tiempo real de resultados</p>
      </div>

      {/* Filtros */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <MapPin className="w-5 h-5 text-blue-600" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Provincia</Label>
              <Select value={selectedProvincia} onValueChange={(val) => {
                setSelectedProvincia(val);
                setSelectedDistrito('all');
              }}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Todas las provincias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las provincias</SelectItem>
                  {provincias.map(p => (
                    <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Distrito</Label>
              <Select 
                value={selectedDistrito} 
                onValueChange={setSelectedDistrito}
                disabled={!selectedProvincia || selectedProvincia === 'all'}
              >
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Todos los distritos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los distritos</SelectItem>
                  {distritosDisponibles.map(d => (
                    <SelectItem key={d.id} value={d.nombre}>{d.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Local de Votación</Label>
              <Select value={selectedLocal} onValueChange={setSelectedLocal}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Todos los locales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los locales</SelectItem>
                  {localesDisponibles.map(local => (
                    <SelectItem key={local} value={local}>{local}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Mesa</Label>
              <Select value={selectedMesa} onValueChange={setSelectedMesa}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Todas las mesas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las mesas</SelectItem>
                  {mesasFiltradas.map(mesa => (
                    <SelectItem key={mesa.id} value={mesa.numero}>Mesa {mesa.numero}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total de Mesas</p>
                <p className="text-3xl font-bold text-slate-800">{totalMesas}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Actas Registradas</p>
                <p className="text-3xl font-bold text-slate-800">{mesasRegistradas}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Avance del Proceso</p>
                <p className="text-3xl font-bold text-slate-800">{porcentajeAvance.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total de Votos</p>
                <p className="text-3xl font-bold text-slate-800">{sumaTotal}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y Tabla con Tabs */}
      <Tabs defaultValue="ranking" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="ranking" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Ranking en Vivo
          </TabsTrigger>
          <TabsTrigger value="tabla" className="gap-2">
            <FileText className="w-4 h-4" />
            Tabla de Resultados
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RANKING EN VIVO */}
        <TabsContent value="ranking" className="space-y-6">
          {/* Gráfico de Barras - ANCHO COMPLETO */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">📊 Votos por Candidato (Ranking en Vivo)</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Los colores muestran los colores de referencia de cada candidato</p>
            </CardHeader>
            <CardContent>
              <BarChartWithLogos data={votosPorCandidato} />
            </CardContent>
          </Card>

        {/* Cards de Votos Especiales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Votos Válidos</p>
                <p className="text-2xl font-bold text-blue-600">{totalVotos}</p>
                <p className="text-xs text-slate-500">{sumaTotal > 0 ? ((totalVotos / sumaTotal) * 100).toFixed(1) : '0'}% del total</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Votos en Blanco</p>
                <p className="text-2xl font-bold text-gray-600">{votosEspeciales.blancos}</p>
                <p className="text-xs text-slate-500">{sumaTotal > 0 ? ((votosEspeciales.blancos / sumaTotal) * 100).toFixed(1) : '0'}% del total</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Votos Nulos</p>
                <p className="text-2xl font-bold text-amber-600">{votosEspeciales.nulos}</p>
                <p className="text-xs text-slate-500">{sumaTotal > 0 ? ((votosEspeciales.nulos / sumaTotal) * 100).toFixed(1) : '0'}% del total</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Votos Impugnados</p>
                <p className="text-2xl font-bold text-red-600">{votosEspeciales.impugnados}</p>
                <p className="text-xs text-slate-500">{sumaTotal > 0 ? ((votosEspeciales.impugnados / sumaTotal) * 100).toFixed(1) : '0'}% del total</p>
              </div>
            </CardContent>
          </Card>
        </div>
        </TabsContent>

        {/* TAB 2: TABLA DE RESULTADOS */}
        <TabsContent value="tabla">
          {/* Tabla resumen */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Ranking Detallado de Candidatos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Posición</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Logo</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Candidato</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Partido</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Votos</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votosPorCandidato.map((candidato, idx) => {
                      const porcentaje = totalVotos > 0 ? (candidato.votos / totalVotos) * 100 : 0;
                      const candidatoColor = candidato.color || '#94A3B8';
                      const getPosicionLabel = (index: number) => {
                        switch (index) {
                          case 0: return '🥇 1°';
                          case 1: return '🥈 2°';
                          case 2: return '🥉 3°';
                          default: return `${index + 1}°`;
                        }
                      };

                      return (
                        <tr key={idx} className={`border-b border-slate-100 hover:brightness-95 transition-all ${idx < 3 ? 'bg-slate-50' : ''}`} style={{ borderLeftColor: candidatoColor, borderLeftWidth: '4px' }}>
                          <td className="py-3 px-4 font-bold text-lg" style={{ color: candidatoColor }}>
                            {getPosicionLabel(idx)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {candidato.logo ? (
                              <img src={candidato.logo} alt={candidato.nombre} className="h-8 w-8 object-contain" />
                            ) : (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-semibold text-sm" style={{ backgroundColor: candidatoColor }}>
                                {candidato.numero}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">{candidato.nombre}</td>
                          <td className="py-3 px-4 text-slate-600">{candidato.partido}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800 text-lg">
                            {candidato.votos.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-bold text-lg" style={{ color: candidatoColor }}>{porcentaje.toFixed(2)}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    );
  } catch (error) {
    console.error('Error en Dashboard:', error);
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-700 mb-2">Error en el Dashboard</h2>
          <p className="text-red-600 mb-4">{String(error)}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
}
