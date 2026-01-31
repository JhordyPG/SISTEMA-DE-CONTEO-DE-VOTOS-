import React, { useState, useMemo } from 'react';
import { useElectoral } from '@/app/context/ElectoralContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Plus, Edit, Trash2, MapPin, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function GestionMesas() {
  const { mesas, agregarMesa, editarMesa, eliminarMesa, provincias, distritos } = useElectoral();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    numero: '',
    local: '',
    provincia: '',
    distrito: '',
    totalVotantes: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const distritosDisponibles = useMemo(() => {
    if (!formData.provincia) return [];
    const provincia = provincias.find(p => p.nombre === formData.provincia);
    if (!provincia) return [];
    return distritos.filter(d => d.provinciaId === provincia.id);
  }, [formData.provincia, provincias, distritos]);

  const resetForm = () => {
    setFormData({ numero: '', local: '', provincia: '', distrito: '', totalVotantes: '' });
    setErrors({});
    setEditingId(null);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.numero.trim()) {
      newErrors.numero = 'El número de mesa es obligatorio';
    } else {
      const existeNumero = mesas.some(
        m => m.numero === formData.numero.trim() && m.id !== editingId
      );
      if (existeNumero) {
        newErrors.numero = 'Este número de mesa ya existe';
      }
    }

    if (!formData.local.trim()) {
      newErrors.local = 'El local de votación es obligatorio';
    }

    if (!formData.provincia) {
      newErrors.provincia = 'Debe seleccionar una provincia';
    }

    if (!formData.distrito) {
      newErrors.distrito = 'Debe seleccionar un distrito';
    }

    if (!formData.totalVotantes.trim()) {
      newErrors.totalVotantes = 'El total de votantes es obligatorio';
    } else {
      const total = parseInt(formData.totalVotantes);
      if (isNaN(total) || total < 1) {
        newErrors.totalVotantes = 'Debe ser un número válido mayor a 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const mesaData = {
      numero: formData.numero.trim(),
      local: formData.local.trim(),
      departamento: 'Piura',
      provincia: formData.provincia,
      distrito: formData.distrito,
      totalVotantes: parseInt(formData.totalVotantes),
    };

    if (editingId) {
      editarMesa(editingId, mesaData);
      toast.success('Mesa actualizada exitosamente');
    } else {
      agregarMesa(mesaData);
      toast.success('Mesa agregada exitosamente');
    }

    setShowDialog(false);
    resetForm();
  };

  const handleEdit = (id: string) => {
    const mesa = mesas.find(m => m.id === id);
    if (mesa) {
      setFormData({
        numero: mesa.numero,
        local: mesa.local,
        provincia: mesa.provincia,
        distrito: mesa.distrito,
        totalVotantes: mesa.totalVotantes.toString(),
      });
      setEditingId(id);
      setShowDialog(true);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      eliminarMesa(deleteId);
      toast.success('Mesa eliminada exitosamente');
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestión de Mesas Electorales</h1>
          <p className="text-slate-600 mt-1">Administre las mesas de votación del departamento de Piura</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Mesa
        </Button>
      </div>

      {/* Lista de Mesas */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <MapPin className="w-5 h-5 text-blue-600" />
            Mesas Registradas ({mesas.length})
          </CardTitle>
          <CardDescription>
            Todas las mesas electorales configuradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mesas.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">No hay mesas registradas</p>
              <p className="text-sm text-slate-400">Agregue la primera mesa usando el botón superior</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">N° Mesa</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Local de Votación</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Ubicación</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Votantes</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mesas.map((mesa) => (
                    <tr key={mesa.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded">
                          {mesa.numero}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-800">{mesa.local}</td>
                      <td className="py-4 px-4 text-slate-600">
                        <div className="flex flex-col">
                          <span className="font-medium">{mesa.distrito}</span>
                          <span className="text-sm text-slate-500">{mesa.provincia} - Piura</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                          {mesa.totalVotantes}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(mesa.id)}
                            className="gap-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(mesa.id)}
                            className="gap-1 border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Formulario */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              {editingId ? 'Editar Mesa Electoral' : 'Nueva Mesa Electoral'}
            </DialogTitle>
            <DialogDescription>
              Complete todos los campos obligatorios para {editingId ? 'actualizar' : 'registrar'} la mesa.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero" className="text-slate-700">
                  Número de Mesa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="Ej: 000123"
                  className={errors.numero ? 'border-red-500' : 'border-slate-300'}
                />
                {errors.numero && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.numero}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalVotantes" className="text-slate-700">
                  Total de Votantes <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalVotantes"
                  type="number"
                  value={formData.totalVotantes}
                  onChange={(e) => setFormData({ ...formData, totalVotantes: e.target.value })}
                  placeholder="Ej: 300"
                  min="1"
                  className={errors.totalVotantes ? 'border-red-500' : 'border-slate-300'}
                />
                {errors.totalVotantes && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.totalVotantes}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="local" className="text-slate-700">
                Local de Votación <span className="text-red-500">*</span>
              </Label>
              <Input
                id="local"
                value={formData.local}
                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                placeholder="Ej: I.E. San Miguel"
                className={errors.local ? 'border-red-500' : 'border-slate-300'}
              />
              {errors.local && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.local}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">
                Departamento
              </Label>
              <Input
                value="Piura"
                disabled
                className="bg-slate-50 border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provincia" className="text-slate-700">
                Provincia <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.provincia} 
                onValueChange={(val) => {
                  setFormData({ ...formData, provincia: val, distrito: '' });
                }}
              >
                <SelectTrigger className={errors.provincia ? 'border-red-500' : 'border-slate-300'}>
                  <SelectValue placeholder="Seleccione una provincia" />
                </SelectTrigger>
                <SelectContent>
                  {provincias.map(p => (
                    <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.provincia && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.provincia}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="distrito" className="text-slate-700">
                Distrito <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.distrito} 
                onValueChange={(val) => setFormData({ ...formData, distrito: val })}
                disabled={!formData.provincia}
              >
                <SelectTrigger className={errors.distrito ? 'border-red-500' : 'border-slate-300'}>
                  <SelectValue placeholder="Seleccione un distrito" />
                </SelectTrigger>
                <SelectContent>
                  {distritosDisponibles.map(d => (
                    <SelectItem key={d.id} value={d.nombre}>{d.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.distrito && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.distrito}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
                className="border-slate-300"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingId ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar esta mesa? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteId(null);
              }}
              className="border-slate-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
