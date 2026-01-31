import React, { useState } from 'react';
import { useElectoral } from '@/app/context/ElectoralContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Plus, Edit, Trash2, UserCheck, AlertCircle, Info, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function GestionPersoneros() {
  const { personeros, agregarPersonero, editarPersonero, eliminarPersonero, mesas } = useElectoral();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    password: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const resetForm = () => {
    setFormData({ nombre: '', dni: '', password: '' });
    setErrors({});
    setEditingId(null);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del personero es obligatorio';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else {
      // Verificar que sea un DNI válido (8 dígitos)
      if (!/^\d{8}$/.test(formData.dni)) {
        newErrors.dni = 'El DNI debe tener 8 dígitos';
      } else {
        // Verificar DNI único
        const existeDni = personeros.some(
          p => p.dni === formData.dni && p.id !== editingId
        );
        if (existeDni) {
          newErrors.dni = 'Este DNI ya está registrado';
        }
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 4) {
      newErrors.password = 'La contraseña debe tener al menos 4 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const personeroData = {
      nombre: formData.nombre.trim(),
      dni: formData.dni.trim(),
      password: formData.password,
    };

    if (editingId) {
      editarPersonero(editingId, personeroData);
      toast.success('Personero actualizado exitosamente');
    } else {
      agregarPersonero(personeroData);
      toast.success('Personero creado exitosamente');
    }

    setShowDialog(false);
    resetForm();
  };

  const handleEdit = (id: string) => {
    const personero = personeros.find(p => p.id === id);
    if (personero) {
      setFormData({
        nombre: personero.nombre,
        dni: personero.dni,
        password: personero.password,
      });
      setEditingId(id);
      setShowDialog(true);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      eliminarPersonero(deleteId);
      toast.success('Personero eliminado exitosamente');
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const getMesaAsignada = (personero: typeof personeros[0]) => {
    if (!personero.mesaId) return null;
    return mesas.find(m => m.id === personero.mesaId);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestión de Personeros</h1>
          <p className="text-slate-600 mt-1">Cree y administre los usuarios personeros del sistema</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Personero
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">
                Información importante
              </p>
              <p className="text-sm text-blue-700">
                Los personeros creados aquí podrán acceder al sistema usando su DNI y contraseña. 
                Luego podrá asignarles una mesa electoral desde la sección "Asignación de Personeros".
                Cada personero solo puede ser asignado a una mesa.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Personeros */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <UserCheck className="w-5 h-5 text-blue-600" />
            Personeros Registrados ({personeros.length})
          </CardTitle>
          <CardDescription>
            Lista de todos los personeros del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {personeros.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">No hay personeros registrados</p>
              <p className="text-sm text-slate-400">Agregue el primer personero usando el botón superior</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Nombre</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">DNI</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Contraseña</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Mesa Asignada</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {personeros.map((personero) => {
                    const mesa = getMesaAsignada(personero);
                    return (
                      <tr key={personero.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4 font-medium text-slate-800">{personero.nombre}</td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {personero.dni}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-slate-400" />
                            <span className="font-mono text-slate-600">{'•'.repeat(personero.password.length)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {mesa ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">Mesa {mesa.numero}</span>
                              <span className="text-sm text-slate-500">{mesa.local}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400 italic">Sin asignar</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(personero.id)}
                              className="gap-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(personero.id)}
                              className="gap-1 border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
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

      {/* Dialog de Formulario */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              {editingId ? 'Editar Personero' : 'Nuevo Personero'}
            </DialogTitle>
            <DialogDescription>
              Complete todos los campos obligatorios para {editingId ? 'actualizar' : 'crear'} el personero.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-slate-700">
                Nombre Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Pedro Martínez López"
                className={errors.nombre ? 'border-red-500' : 'border-slate-300'}
              />
              {errors.nombre && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.nombre}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni" className="text-slate-700">
                DNI <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dni"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="Ej: 12345678"
                maxLength={8}
                className={errors.dni ? 'border-red-500' : 'border-slate-300'}
              />
              {errors.dni && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.dni}
                </p>
              )}
              <p className="text-xs text-slate-500">
                El DNI será usado como usuario para iniciar sesión
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Contraseña <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Ej: 1234"
                className={errors.password ? 'border-red-500' : 'border-slate-300'}
              />
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
              <p className="text-xs text-slate-500">
                Mínimo 4 caracteres
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Nota:</strong> La asignación de mesa se realiza desde la sección "Asignación de Personeros"
              </p>
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
                {editingId ? 'Actualizar' : 'Crear Personero'}
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
              ¿Está seguro que desea eliminar este personero? Esta acción no se puede deshacer.
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
