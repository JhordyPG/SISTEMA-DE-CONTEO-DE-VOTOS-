import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useElectoral } from '@/app/context/ElectoralContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { FileText, CheckCircle, TrendingUp, MapPin } from 'lucide-react';
/* import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie } from 'recharts'; */

/* ======================================================
   Componente Gráfico de Barras con Logos seguro
   (COMENTADO)
====================================================== */
/*
const BarChartWithLogos = ({ data }: { data: any[] }) => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!data || data.length === 0) {
    return <p className="text-center text-slate-500 py-10">Sin datos</p>;
  }

  return (
    <div ref={containerRef} className="relative w-full min-h-[400px] h-[500px]">
      Logos arriba
      <div className="absolute top-0 left-0 w-full flex justify-around z-10 pointer-events-none">
        {data.map(c => (
          <div key={c.numero} className="flex flex-col items-center" style={{ width: `${100 / data.length}%` }}>
            {c.logo && <img src={c.logo} alt={c.nombre} className="w-10 h-10 object-contain mb-1" />}
            <span className="text-xs font-semibold text-slate-600">{c.numero}</span>
          </div>
        ))}
      </div>

      {mounted && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 80, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="partido" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip formatter={(v: number) => [`${v} votos`, 'Votos']} />
            <Bar dataKey="votos" radius={[8, 8, 0, 0]} isAnimationActive={false}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color || '#94A3B8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
*/

/* ======================================================
   Dashboard Principal
====================================================== */
export function Dashboard() {
  try {
    const { candidatos, mesas, actas, provincias, distritos } = useElectoral();

    const [selectedProvincia, setSelectedProvincia] = useState<string>('all');
    const [selectedDistrito, setSelectedDistrito] = useState<string>('all');
    const [selectedLocal, setSelectedLocal] = useState<string>('all');
    const [selectedMesa, setSelectedMesa] = useState<string>('all');

    // Filtrar mesas
    const mesasFiltradas = useMemo(() => {
      return mesas.filter(mesa => {
        if (selectedProvincia !== 'all' && mesa.provincia !== selectedProvincia) return false;
        if (selectedDistrito !== 'all' && mesa.distrito !== selectedDistrito) return false;
        if (selectedLocal !== 'all' && mesa.local !== selectedLocal) return false;
        if (selectedMesa !== 'all' && mesa.numero !== selectedMesa) return false;
        return true;
      });
    }, [mesas, selectedProvincia, selectedDistrito, selectedLocal, selectedMesa]);

    // Filtrar actas
    const actasFiltradas = useMemo(() => {
      const mesasIds = new Set(mesasFiltradas.map(m => m.id));
      return actas.filter(acta => mesasIds.has(acta.mesaId));
    }, [actas, mesasFiltradas]);

    // KPIs
    const totalMesas = mesasFiltradas.length;
    const mesasRegistradas = actasFiltradas.length;
    const porcentajeAvance = totalMesas > 0 ? (mesasRegistradas / totalMesas) * 100 : 0;

    // Votos por candidato
    const votosPorCandidato = useMemo(() => {
      const votos: Record<string, number> = {};
      candidatos.forEach(c => votos[c.id] = 0);

      actasFiltradas.forEach(acta => {
        Object.entries(acta.votosPorCandidato).forEach(([cId, cant]) => {
          if (votos[cId] !== undefined) votos[cId] += cant;
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

    // Votos especiales
    const votosEspeciales = useMemo(() => {
      let blancos = 0, nulos = 0, impugnados = 0;
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
    const porcentajeValidez = sumaTotal > 0 ? ((totalVotos / sumaTotal) * 100).toFixed(1) : '0';

    // Datos para gráficos (COMENTADOS)
    /*
    const dataPie = votosPorCandidato.map(c => ({ name: `${c.numero}. ${c.nombre}`, value: c.votos }));
    const dataVotosEspeciales = [
      { name: 'Votos Válidos', value: totalVotos, fill: '#3B82F6' },
      { name: 'Votos Blancos', value: votosEspeciales.blancos, fill: '#10B981' },
      { name: 'Votos Nulos', value: votosEspeciales.nulos, fill: '#F59E0B' },
      { name: 'Votos Impugnados', value: votosEspeciales.impugnados, fill: '#EF4444' },
    ];
    */

    const distritosDisponibles = useMemo(() => {
      if (selectedProvincia === 'all') return [];
      const provincia = provincias.find(p => p.nombre === selectedProvincia);
      return distritos.filter(d => provincia && d.provinciaId === provincia.id);
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
              {/* Provincia */}
              <div className="space-y-2">
                <Label className="text-slate-700">Provincia</Label>
                <Select value={selectedProvincia} onValueChange={val => { setSelectedProvincia(val); setSelectedDistrito('all'); }}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Todas las provincias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las provincias</SelectItem>
                    {provincias.map(p => <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Distrito */}
              <div className="space-y-2">
                <Label className="text-slate-700">Distrito</Label>
                <Select value={selectedDistrito} onValueChange={setSelectedDistrito} disabled={selectedProvincia === 'all'}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Todos los distritos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los distritos</SelectItem>
                    {distritosDisponibles.map(d => <SelectItem key={d.id} value={d.nombre}>{d.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Local */}
              <div className="space-y-2">
                <Label className="text-slate-700">Local de Votación</Label>
                <Select value={selectedLocal} onValueChange={setSelectedLocal}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Todos los locales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los locales</SelectItem>
                    {localesDisponibles.map(local => <SelectItem key={local} value={local}>{local}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Mesa */}
              <div className="space-y-2">
                <Label className="text-slate-700">Mesa</Label>
                <Select value={selectedMesa} onValueChange={setSelectedMesa}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Todas las mesas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las mesas</SelectItem>
                    {mesasFiltradas.map(mesa => <SelectItem key={mesa.id} value={mesa.numero}>Mesa {mesa.numero}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total de Mesas', value: totalMesas, icon: <FileText className="w-6 h-6 text-blue-600" />, color: 'bg-blue-100' },
            { label: 'Actas Registradas', value: mesasRegistradas, icon: <CheckCircle className="w-6 h-6 text-green-600" />, color: 'bg-green-100' },
            { label: 'Avance del Proceso', value: `${porcentajeAvance.toFixed(1)}%`, icon: <TrendingUp className="w-6 h-6 text-orange-600" />, color: 'bg-orange-100' },
            { label: 'Total de Votos', value: sumaTotal, icon: <FileText className="w-6 h-6 text-purple-600" />, color: 'bg-purple-100' },
          ].map((kpi, idx) => (
            <Card key={idx} className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{kpi.label}</p>
                    <p className="text-3xl font-bold text-slate-800">{kpi.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${kpi.color} rounded-lg flex items-center justify-center`}>
                    {kpi.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ranking" className="gap-2"><TrendingUp className="w-4 h-4" />Ranking en Vivo</TabsTrigger>
            <TabsTrigger value="tabla" className="gap-2"><FileText className="w-4 h-4" />Tabla de Resultados</TabsTrigger>
          </TabsList>

          {/* TAB 1: Ranking */}
          <TabsContent value="ranking" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800">📊 Votos por Candidato (Ranking en Vivo)</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Los colores muestran los colores de referencia de cada candidato</p>
              </CardHeader>
              <CardContent>
                {/* Gráfico comentado */}
                {/*
                <BarChartWithLogos data={votosPorCandidato} />
                */}
              </CardContent>
            </Card>

            {/* Cards de votos especiales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Votos Válidos', value: totalVotos, color: 'text-blue-600', porcentaje: totalVotos > 0 ? ((totalVotos / sumaTotal) * 100).toFixed(1) : '0' },
                { label: 'Votos en Blanco', value: votosEspeciales.blancos, color: 'text-gray-600', porcentaje: totalVotos > 0 ? ((votosEspeciales.blancos / sumaTotal) * 100).toFixed(1) : '0' },
                { label: 'Votos Nulos', value: votosEspeciales.nulos, color: 'text-amber-600', porcentaje: totalVotos > 0 ? ((votosEspeciales.nulos / sumaTotal) * 100).toFixed(1) : '0' },
                { label: 'Votos Impugnados', value: votosEspeciales.impugnados, color: 'text-red-600', porcentaje: totalVotos > 0 ? ((votosEspeciales.impugnados / sumaTotal) * 100).toFixed(1) : '0' },
              ].map((item, idx) => (
                <Card key={idx} className="border-slate-200">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">{item.label}</p>
                      <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-xs text-slate-500">{item.porcentaje}% del total</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: Tabla */}
          <TabsContent value="tabla">
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
                        const color = candidato.color || '#94A3B8';
                        const getPos = (i: number) => i === 0 ? '🥇 1°' : i === 1 ? '🥈 2°' : i === 2 ? '🥉 3°' : `${i+1}°`;
                        return (
                          <tr key={idx} className={`border-b border-slate-100 hover:brightness-95 transition-all ${idx<3?'bg-slate-50':''}`} style={{ borderLeftColor: color, borderLeftWidth: '4px' }}>
                            <td className="py-3 px-4 font-bold text-lg" style={{color}}>{getPos(idx)}</td>
                            <td className="py-3 px-4 text-center">
                              {candidato.logo ? <img src={candidato.logo} className="w-6 h-6 mx-auto object-contain" alt={candidato.nombre}/> : '-'}
                            </td>
                            <td className="py-3 px-4">{candidato.nombre}</td>
                            <td className="py-3 px-4">{candidato.partido}</td>
                            <td className="py-3 px-4 text-right">{candidato.votos}</td>
                            <td className="py-3 px-4 text-right">{porcentaje.toFixed(1)}%</td>
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
  } catch (err) {
    return <p className="text-red-600 text-center p-10">Error al cargar el dashboard</p>;
  }
}
