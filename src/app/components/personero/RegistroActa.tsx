import React, { useState, useMemo } from 'react';
import { useElectoral } from '@/app/context/ElectoralContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { AlertCircle, CheckCircle, LogOut, MapPin, Users, FileText, Upload, Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';

export function RegistroActa() {
  const { usuarioActual, mesas, candidatos, actas, registrarActa, logout } = useElectoral();
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    votosBlancos: '',
    votosNulos: '',
    votosImpugnados: '',
    votosPorCandidato: {} as { [key: string]: string },
  });

  const mesa = mesas.find(m => m.id === usuarioActual?.mesaId);
  const actaExistente = actas.find(a => a.mesaId === usuarioActual?.mesaId);

  // Calcular votos válidos (suma de votos por candidato)
  const votosValidos = useMemo(() => {
    return Object.values(formData.votosPorCandidato).reduce((sum, val) => {
      const num = parseInt(val || '0');
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [formData.votosPorCandidato]);

  // Calcular suma total
  const sumaTotal = useMemo(() => {
    const blancos = parseInt(formData.votosBlancos || '0');
    const nulos = parseInt(formData.votosNulos || '0');
    const impugnados = parseInt(formData.votosImpugnados || '0');
    return votosValidos + (isNaN(blancos) ? 0 : blancos) + (isNaN(nulos) ? 0 : nulos) + (isNaN(impugnados) ? 0 : impugnados);
  }, [votosValidos, formData.votosBlancos, formData.votosNulos, formData.votosImpugnados]);

  // Validar si la suma coincide con total de votantes
  const totalVotantes = mesa?.totalVotantes || 0;
  const isValid = totalVotantes > 0 && sumaTotal === totalVotantes;
  const showError = sumaTotal > 0 && sumaTotal !== totalVotantes;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCandidatoVotos = (candidatoId: string, value: string) => {
    setFormData({
      ...formData,
      votosPorCandidato: {
        ...formData.votosPorCandidato,
        [candidatoId]: value,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error('La suma de votos no coincide con el total de votantes');
      return;
    }

    if (!mesa) {
      toast.error('No se encontró la mesa asignada');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSubmit = () => {
    if (!mesa) return;

    const votosPorCandidato: { [key: string]: number } = {};
    Object.entries(formData.votosPorCandidato).forEach(([id, val]) => {
      votosPorCandidato[id] = parseInt(val || '0');
    });

    registrarActa({
      mesaId: mesa.id,
      totalVotantes: mesa.totalVotantes,
      votosBlancos: parseInt(formData.votosBlancos || '0'),
      votosNulos: parseInt(formData.votosNulos || '0'),
      votosImpugnados: parseInt(formData.votosImpugnados || '0'),
      votosPorCandidato,
      imagenUrl: imagePreview || undefined,
      estado: 'Enviada',
    });

    toast.success('Acta registrada exitosamente');
    setShowConfirmDialog(false);
  };

  if (!mesa) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Mesa no asignada</h2>
              <p className="text-slate-600 mb-4">
                No tiene una mesa asignada. Contacte al administrador del sistema.
              </p>
              <Button onClick={logout} variant="outline" className="gap-2">
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (actaExistente) {
    const mesaDelActa = mesas.find(m => m.id === actaExistente.mesaId);
    const votosValoresActa = Object.values(actaExistente.votosPorCandidato).reduce((sum, val) => sum + val, 0);
    const sumaTotal = votosValoresActa + actaExistente.votosBlancos + actaExistente.votosNulos + actaExistente.votosImpugnados;
    
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">Sistema Electoral</h1>
                <p className="text-sm text-slate-600">{usuarioActual?.nombre}</p>
              </div>
            </div>
            <Button onClick={logout} variant="outline" size="sm" className="gap-2">
              <LogOut className="w-4 h-4" />
              Salir
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
          {/* Encabezado de Acta Registrada */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-green-900 mb-2">Acta Registrada Exitosamente</h2>
                  <p className="text-green-800">
                    El acta de esta mesa ha sido enviada y está protegida. Aquí puede ver un resumen de los datos registrados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la Mesa */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <MapPin className="w-5 h-5 text-blue-600" />
                Información de la Mesa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Número de Mesa</p>
                  <p className="font-bold text-lg text-slate-800">{mesaDelActa?.numero}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Local</p>
                  <p className="font-semibold text-slate-800">{mesaDelActa?.local}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Distrito</p>
                  <p className="font-semibold text-slate-800">{mesaDelActa?.distrito}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Provincia</p>
                  <p className="font-semibold text-slate-800">{mesaDelActa?.provincia}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de Votos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Votos Válidos por Candidato */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Users className="w-5 h-5 text-blue-600" />
                  Votos por Candidato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {candidatos.map(candidato => {
                    const votos = actaExistente.votosPorCandidato[candidato.id] || 0;
                    const porcentaje = sumaTotal > 0 ? ((votos / sumaTotal) * 100).toFixed(1) : '0';
                    return (
                      <div key={candidato.id} className="border border-slate-200 rounded-lg p-3 bg-white">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex-shrink-0 text-sm">
                            {candidato.numero}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate">{candidato.nombre}</p>
                            <p className="text-xs text-slate-500">{candidato.partido}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-slate-800 text-lg">{votos}</p>
                            <p className="text-xs text-slate-600">{porcentaje}%</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Resumen de Votos */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Resumen de Votación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 mb-2">Total de Votantes Registrados</p>
                  <p className="text-3xl font-bold text-blue-900">{actaExistente.totalVotantes}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">Votos Válidos (candidatos)</span>
                    <span className="font-bold text-slate-800 text-lg">{votosValoresActa}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">Votos Blancos</span>
                    <span className="font-bold text-slate-800 text-lg">{actaExistente.votosBlancos}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">Votos Nulos</span>
                    <span className="font-bold text-slate-800 text-lg">{actaExistente.votosNulos}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">Votos Impugnados</span>
                    <span className="font-bold text-slate-800 text-lg">{actaExistente.votosImpugnados}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-green-100 rounded-lg border-2 border-green-300">
                    <span className="font-bold text-green-900 text-lg">TOTAL REGISTRADO</span>
                    <span className="font-bold text-green-900 text-2xl">{sumaTotal}</span>
                  </div>

                  {sumaTotal === actaExistente.totalVotantes && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-green-700 font-medium">Suma validada correctamente</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información de Envío */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Información de Envío</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Estado del Acta</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-700">{actaExistente.estado}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Fecha de Envío</p>
                  <p className="font-semibold text-slate-800">
                    {new Date(actaExistente.fechaEnvio).toLocaleDateString('es-PE')} <br />
                    <span className="text-sm text-slate-600">
                      {new Date(actaExistente.fechaEnvio).toLocaleTimeString('es-PE')}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Dirección IP</p>
                  <p className="font-mono text-sm text-slate-800 break-all">{actaExistente.ipAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nota de Protección */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Acta Protegida</p>
                  <p className="text-sm text-blue-800">
                    Una vez registrada, el acta no puede ser modificada. Si encuentra errores, contacte al administrador del sistema.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">Sistema Electoral</h1>
              <p className="text-sm text-slate-600">{usuarioActual?.nombre}</p>
            </div>
          </div>
          <Button onClick={logout} variant="outline" size="sm" className="gap-2">
            <LogOut className="w-4 h-4" />
            Salir
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Información de la Mesa */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <MapPin className="w-5 h-5 text-blue-600" />
              Información de su Mesa Asignada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-blue-800 mb-1">Número de Mesa</p>
                <p className="font-bold text-blue-900 text-lg">{mesa.numero}</p>
              </div>
              <div>
                <p className="text-sm text-blue-800 mb-1">Local</p>
                <p className="font-semibold text-blue-900">{mesa.local}</p>
              </div>
              <div>
                <p className="text-sm text-blue-800 mb-1">Distrito</p>
                <p className="font-semibold text-blue-900">{mesa.distrito}</p>
              </div>
              <div>
                <p className="text-sm text-blue-800 mb-1">Total de Votantes</p>
                <p className="font-bold text-blue-900 text-lg">{mesa.totalVotantes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de Registro */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Registro de Acta de Votación</CardTitle>
            <CardDescription>
              Complete todos los campos con la información del acta física
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Total de Votantes - Solo Lectura */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Total de Votantes
                </h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-1">Total de votantes registrados para esta mesa:</p>
                  <p className="text-3xl font-bold text-blue-900">{totalVotantes}</p>
                </div>
              </div>

              {/* Datos Generales */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Votos Especiales
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="votosBlancos" className="text-slate-700">
                      Votos Blancos
                    </Label>
                    <Input
                      id="votosBlancos"
                      type="number"
                      min="0"
                      value={formData.votosBlancos}
                      onChange={(e) => setFormData({ ...formData, votosBlancos: e.target.value })}
                      placeholder="Ej: 10"
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="votosNulos" className="text-slate-700">
                      Votos Nulos
                    </Label>
                    <Input
                      id="votosNulos"
                      type="number"
                      min="0"
                      value={formData.votosNulos}
                      onChange={(e) => setFormData({ ...formData, votosNulos: e.target.value })}
                      placeholder="Ej: 5"
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="votosImpugnados" className="text-slate-700">
                      Votos Impugnados
                    </Label>
                    <Input
                      id="votosImpugnados"
                      type="number"
                      min="0"
                      value={formData.votosImpugnados}
                      onChange={(e) => setFormData({ ...formData, votosImpugnados: e.target.value })}
                      placeholder="Ej: 3"
                      className="border-slate-300"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Votos por Candidato
                </h3>

                <div className="space-y-3">
                  {candidatos.map(candidato => (
                    <div key={candidato.id} className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg bg-white">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex-shrink-0">
                        {candidato.numero}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{candidato.nombre}</p>
                        <p className="text-sm text-slate-500">{candidato.partido}</p>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          min="0"
                          value={formData.votosPorCandidato[candidato.id] || ''}
                          onChange={(e) => handleCandidatoVotos(candidato.id, e.target.value)}
                          placeholder="0"
                          className="text-center border-slate-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicador de Votos Válidos */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Votos Válidos (por candidatos):</span>
                    <span className="text-xl font-bold text-blue-600">{votosValidos}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">+ Votos Blancos:</span>
                    <span className="font-semibold text-slate-800">{parseInt(formData.votosBlancos || '0')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">+ Votos Nulos:</span>
                    <span className="font-semibold text-slate-800">{parseInt(formData.votosNulos || '0')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">+ Votos Impugnados:</span>
                    <span className="font-semibold text-slate-800">{parseInt(formData.votosImpugnados || '0')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-300 flex items-center justify-between font-bold">
                    <span className="text-slate-800">TOTAL:</span>
                    <span className={`text-xl ${isValid ? 'text-green-600' : showError ? 'text-red-600' : 'text-slate-800'}`}>{sumaTotal}</span>
                  </div>
                </div>
              </div>

              {/* Validación */}
              {(sumaTotal > 0) && (
                <div className={`p-4 rounded-lg border ${
                  isValid 
                    ? 'bg-green-50 border-green-200' 
                    : showError 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium mb-2 ${isValid ? 'text-green-900' : 'text-red-900'}`}>
                        Validación de Suma
                      </p>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className={isValid ? 'text-green-700' : 'text-red-700'}>Votos Válidos:</span>
                          <span className="font-semibold">{votosValidos}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isValid ? 'text-green-700' : 'text-red-700'}>Votos Blancos:</span>
                          <span className="font-semibold">{parseInt(formData.votosBlancos || '0')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isValid ? 'text-green-700' : 'text-red-700'}>Votos Nulos:</span>
                          <span className="font-semibold">{parseInt(formData.votosNulos || '0')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isValid ? 'text-green-700' : 'text-red-700'}>Votos Impugnados:</span>
                          <span className="font-semibold">{parseInt(formData.votosImpugnados || '0')}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-current">
                          <span className={`font-semibold ${isValid ? 'text-green-900' : 'text-red-900'}`}>Suma Total:</span>
                          <span className="font-bold">{sumaTotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`font-semibold ${isValid ? 'text-green-900' : 'text-red-900'}`}>Total Votantes:</span>
                          <span className="font-bold">{totalVotantes}</span>
                        </div>
                      </div>
                      {!isValid && showError && (
                        <p className="text-red-700 font-medium mt-2">
                          ⚠️ La suma no coincide. Verifique los datos ingresados.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Subida de Imagen */}
              <div className="space-y-2">
                <Label htmlFor="imagen" className="text-slate-700">
                  Imagen del Acta (Opcional)
                </Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img src={imagePreview} alt="Vista previa" className="max-w-full h-auto rounded-lg" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setImagePreview(null)}
                        className="w-full"
                      >
                        Remover Imagen
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-2">Suba una foto del acta física</p>
                      <Input
                        id="imagen"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de Envío */}
              <Button
                type="submit"
                disabled={!isValid}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Enviar Acta
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Confirmar Envío</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea enviar el acta? Una vez enviada, no podrá modificarla.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Verifique que todos los datos sean correctos antes de enviar.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-slate-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirmar y Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
