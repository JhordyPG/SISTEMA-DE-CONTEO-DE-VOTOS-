import React, { useState, useMemo } from 'react';
import { useElectoral } from '@/app/context/ElectoralContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { FileText, CheckCircle, AlertCircle, Eye, XCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export function RevisionActas() {
  const { actas, mesas, candidatos, cambiarEstadoActa, provincias } = useElectoral();
  
  const [selectedProvincia, setSelectedProvincia] = useState<string>('all');
  const [selectedEstado, setSelectedEstado] = useState<string>('all');
  const [selectedActa, setSelectedActa] = useState<string | null>(null);

  const actasFiltradas = useMemo(() => {
    return actas.filter(acta => {
      const mesa = mesas.find(m => m.id === acta.mesaId);
      if (!mesa) return false;

      if (selectedProvincia !== 'all' && mesa.provincia !== selectedProvincia) return false;
      if (selectedEstado !== 'all' && acta.estado !== selectedEstado) return false;

      return true;
    });
  }, [actas, mesas, selectedProvincia, selectedEstado]);

  const actaDetalle = selectedActa ? actas.find(a => a.id === selectedActa) : null;
  const mesaDetalle = actaDetalle ? mesas.find(m => m.id === actaDetalle.mesaId) : null;

  const handleValidar = (id: string) => {
    cambiarEstadoActa(id, 'Validada');
    toast.success('Acta validada exitosamente');
    setSelectedActa(null);
  };

  const handleObservar = (id: string) => {
    cambiarEstadoActa(id, 'Observada');
    toast.success('Acta marcada como observada');
    setSelectedActa(null);
  };

  const calcularVotosValidos = (acta: typeof actaDetalle) => {
    if (!acta) return 0;
    return Object.values(acta.votosPorCandidato).reduce((sum, votos) => sum + votos, 0);
  };

  const estadoBadge = (estado: string) => {
    switch (estado) {
      case 'Validada':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <CheckCircle className="w-3 h-3" />
            Validada
          </span>
        );
      case 'Observada':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
            <XCircle className="w-3 h-3" />
            Observada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            <AlertCircle className="w-3 h-3" />
            Enviada
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Revisión de Actas</h1>
        <p className="text-slate-600 mt-1">Valide o marque como observadas las actas enviadas</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Actas</p>
                <p className="text-3xl font-bold text-slate-800">{actas.length}</p>
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
                <p className="text-sm text-slate-600 mb-1">Enviadas</p>
                <p className="text-3xl font-bold text-slate-800">
                  {actas.filter(a => a.estado === 'Enviada').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Validadas</p>
                <p className="text-3xl font-bold text-slate-800">
                  {actas.filter(a => a.estado === 'Validada').length}
                </p>
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
                <p className="text-sm text-slate-600 mb-1">Observadas</p>
                <p className="text-3xl font-bold text-slate-800">
                  {actas.filter(a => a.estado === 'Observada').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label className="text-slate-700">Estado</Label>
              <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Enviada">Enviada</SelectItem>
                  <SelectItem value="Validada">Validada</SelectItem>
                  <SelectItem value="Observada">Observada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Actas */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <FileText className="w-5 h-5 text-blue-600" />
            Actas Registradas ({actasFiltradas.length})
          </CardTitle>
          <CardDescription>
            Haga clic en una acta para ver los detalles completos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">No hay actas para mostrar</p>
              <p className="text-sm text-slate-400">Intente ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Mesa</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Ubicación</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Fecha/Hora</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {actasFiltradas.map((acta) => {
                    const mesa = mesas.find(m => m.id === acta.mesaId);
                    return (
                      <tr key={acta.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4">
                          <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded">
                            {mesa?.numero}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">{mesa?.local}</span>
                            <span className="text-sm text-slate-500">
                              {mesa?.distrito}, {mesa?.provincia}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">{estadoBadge(acta.estado)}</td>
                        <td className="py-4 px-4 text-slate-600">
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {new Date(acta.fechaEnvio).toLocaleDateString('es-PE')}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(acta.fechaEnvio).toLocaleTimeString('es-PE')}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedActa(acta.id)}
                              className="gap-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                            >
                              <Eye className="w-4 h-4" />
                              Ver Detalle
                            </Button>
                          </div>
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

      {/* Dialog de Detalle */}
      <Dialog open={!!selectedActa} onOpenChange={() => setSelectedActa(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Detalle del Acta</DialogTitle>
            <DialogDescription>
              Mesa {mesaDetalle?.numero} - {mesaDetalle?.local}
            </DialogDescription>
          </DialogHeader>

          {actaDetalle && mesaDetalle && (
            <div className="space-y-6 py-4">
              {/* Información de la Mesa */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-slate-800 mb-3">Información de la Mesa</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">Número de Mesa:</span>
                    <p className="font-semibold text-slate-800">{mesaDetalle.numero}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Local:</span>
                    <p className="font-semibold text-slate-800">{mesaDetalle.local}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Ubicación:</span>
                    <p className="font-semibold text-slate-800">
                      {mesaDetalle.distrito}, {mesaDetalle.provincia}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Estado:</span>
                    <div className="mt-1">{estadoBadge(actaDetalle.estado)}</div>
                  </div>
                </div>
              </div>

              {/* Datos del Acta */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">Resumen de Votación</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-lg p-3">
                    <p className="text-sm text-slate-600 mb-1">Total Votantes</p>
                    <p className="text-2xl font-bold text-slate-800">{actaDetalle.totalVotantes}</p>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3">
                    <p className="text-sm text-slate-600 mb-1">Votos Válidos</p>
                    <p className="text-2xl font-bold text-blue-600">{calcularVotosValidos(actaDetalle)}</p>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3">
                    <p className="text-sm text-slate-600 mb-1">Votos Blancos</p>
                    <p className="text-2xl font-bold text-slate-600">{actaDetalle.votosBlancos}</p>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3">
                    <p className="text-sm text-slate-600 mb-1">Votos Nulos</p>
                    <p className="text-2xl font-bold text-slate-600">{actaDetalle.votosNulos}</p>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3">
                    <p className="text-sm text-slate-600 mb-1">Votos Impugnados</p>
                    <p className="text-2xl font-bold text-slate-600">{actaDetalle.votosImpugnados}</p>
                  </div>
                </div>
              </div>

              {/* Votos por Candidato */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">Votos por Candidato</h3>
                <div className="space-y-2">
                  {candidatos.map(candidato => {
                    const votos = actaDetalle.votosPorCandidato[candidato.id] || 0;
                    return (
                      <div
                        key={candidato.id}
                        className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold">
                            {candidato.numero}
                          </span>
                          <div>
                            <p className="font-medium text-slate-800">{candidato.nombre}</p>
                            <p className="text-sm text-slate-500">{candidato.partido}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{votos}</p>
                          <p className="text-xs text-slate-500">votos</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Fecha de envío:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(actaDetalle.fechaEnvio).toLocaleString('es-PE')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Dirección IP:</span>
                  <span className="font-mono font-semibold text-slate-800">{actaDetalle.ipAddress}</span>
                </div>
              </div>

              {/* Acciones */}
              {actaDetalle.estado === 'Enviada' && (
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <Button
                    onClick={() => handleValidar(actaDetalle.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Validar Acta
                  </Button>
                  <Button
                    onClick={() => handleObservar(actaDetalle.id)}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50 gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Marcar como Observada
                  </Button>
                </div>
              )}

              {actaDetalle.estado !== 'Enviada' && (
                <div className="pt-4 border-t border-slate-200 text-center text-sm text-slate-600">
                  Esta acta ya ha sido {actaDetalle.estado.toLowerCase()}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
