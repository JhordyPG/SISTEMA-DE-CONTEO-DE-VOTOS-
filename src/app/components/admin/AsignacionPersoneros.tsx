import React, { useState, useMemo } from 'react';
import { useElectoral } from '@/app/context/ElectoralContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { UserCheck, Users, CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

export function AsignacionPersoneros() {
  const { personeros, mesas, asignarMesa, provincias } = useElectoral();
  
  const [selectedProvincia, setSelectedProvincia] = useState<string>('all');
  const [selectedEstado, setSelectedEstado] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const personerosFiltrados = useMemo(() => {
    return personeros.filter(personero => {
      // Filtrar por búsqueda
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          personero.nombre.toLowerCase().includes(search) ||
          personero.dni.includes(search);
        if (!matchesSearch) return false;
      }

      // Filtrar por estado
      if (selectedEstado === 'asignado' && !personero.mesaId) return false;
      if (selectedEstado === 'sin-asignar' && personero.mesaId) return false;

      // Filtrar por provincia
      if (selectedProvincia !== 'all' && personero.mesaId) {
        const mesa = mesas.find(m => m.id === personero.mesaId);
        if (!mesa || mesa.provincia !== selectedProvincia) return false;
      }

      return true;
    });
  }, [personeros, searchTerm, selectedEstado, selectedProvincia, mesas]);

  const mesasAsignadas = personeros.filter(p => p.mesaId).length;
  const mesasSinAsignar = mesas.length - mesasAsignadas;

  const handleAsignarMesa = (personeroId: string, mesaId: string | undefined) => {
    // Verificar si la mesa ya está asignada a otro personero
    if (mesaId) {
      const yaAsignada = personeros.some(p => p.mesaId === mesaId && p.id !== personeroId);
      if (yaAsignada) {
        toast.error('Esta mesa ya está asignada a otro personero');
        return;
      }
    }

    asignarMesa(personeroId, mesaId);
    
    if (mesaId) {
      const mesa = mesas.find(m => m.id === mesaId);
      toast.success(`Mesa ${mesa?.numero} asignada exitosamente`);
    } else {
      toast.success('Asignación removida exitosamente');
    }
  };

  const mesasDisponibles = useMemo(() => {
    const mesasAsignadasIds = new Set(personeros.filter(p => p.mesaId).map(p => p.mesaId));
    return mesas.filter(m => !mesasAsignadasIds.has(m.id));
  }, [mesas, personeros]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Asignación de Personeros</h1>
        <p className="text-slate-600 mt-1">Asigne personeros a mesas electorales</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Personeros</p>
                <p className="text-3xl font-bold text-slate-800">{personeros.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Mesas Asignadas</p>
                <p className="text-3xl font-bold text-slate-800">{mesasAsignadas}</p>
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
                <p className="text-sm text-slate-600 mb-1">Mesas Sin Asignar</p>
                <p className="text-3xl font-bold text-slate-800">{mesasSinAsignar}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Nombre o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Estado de Asignación</Label>
              <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="asignado">Asignados</SelectItem>
                  <SelectItem value="sin-asignar">Sin Asignar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Provincia</Label>
              <Select value={selectedProvincia} onValueChange={setSelectedProvincia}>
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
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Personeros */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <UserCheck className="w-5 h-5 text-blue-600" />
            Personeros ({personerosFiltrados.length})
          </CardTitle>
          <CardDescription>
            Asigne o reasigne mesas a los personeros
          </CardDescription>
        </CardHeader>
        <CardContent>
          {personerosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">No se encontraron personeros</p>
              <p className="text-sm text-slate-400">Intente ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Nombre</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">DNI</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Mesa Asignada</th>
                  </tr>
                </thead>
                <tbody>
                  {personerosFiltrados.map((personero) => {
                    const mesaAsignada = mesas.find(m => m.id === personero.mesaId);
                    const mesasParaEstePersonero = personero.mesaId 
                      ? [...mesasDisponibles, mesaAsignada!] 
                      : mesasDisponibles;

                    return (
                      <tr key={personero.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4 font-medium text-slate-800">{personero.nombre}</td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-slate-600">{personero.dni}</span>
                        </td>
                        <td className="py-4 px-4">
                          {personero.mesaId ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Asignado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
                              <XCircle className="w-3 h-3" />
                              Sin Asignar
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Select
                            value={personero.mesaId || 'none'}
                            onValueChange={(value) => handleAsignarMesa(personero.id, value === 'none' ? undefined : value)}
                          >
                            <SelectTrigger className="w-full max-w-xs border-slate-300">
                              <SelectValue placeholder="Seleccionar mesa..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sin asignar</SelectItem>
                              {mesasParaEstePersonero.map(mesa => (
                                <SelectItem key={mesa.id} value={mesa.id}>
                                  Mesa {mesa.numero} - {mesa.local} ({mesa.distrito})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reglas Visuales */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm text-blue-900 font-medium mb-3">Reglas de Asignación</p>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                <p>Un personero solo puede ser asignado a una mesa</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                <p>Una mesa solo puede tener un personero asignado</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                <p>El personero podrá acceder al sistema usando su DNI y contraseña</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
