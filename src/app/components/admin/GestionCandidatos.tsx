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
import { Plus, Edit, Trash2, Users, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

export function GestionCandidatos() {
  const { candidatos, agregarCandidato, editarCandidato, eliminarCandidato } = useElectoral();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    partido: '',
    numero: '',
    color: '#3B82F6',
    logo: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [logoPreview, setLogoPreview] = useState<string>('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, logo: base64 });
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', partido: '', numero: '', color: '#3B82F6', logo: '' });
    setLogoPreview('');
    setErrors({});
    setEditingId(null);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del candidato es obligatorio';
    }

    if (!formData.partido.trim()) {
      newErrors.partido = 'El partido político es obligatorio';
    }

    if (!formData.numero.trim()) {
      newErrors.numero = 'El número del candidato es obligatorio';
    } else {
      const numero = parseInt(formData.numero);
      if (isNaN(numero) || numero < 1) {
        newErrors.numero = 'Debe ser un número válido mayor a 0';
      } else {
        // Verificar número único
        const existeNumero = candidatos.some(
          c => c.numero === numero && c.id !== editingId
        );
        if (existeNumero) {
          newErrors.numero = 'Este número ya está asignado a otro candidato';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const candidatoData = {
      nombre: formData.nombre.trim(),
      partido: formData.partido.trim(),
      numero: parseInt(formData.numero),
      color: formData.color,
      logo: formData.logo.trim() || undefined,
    };

    if (editingId) {
      editarCandidato(editingId, candidatoData);
      toast.success('Candidato actualizado exitosamente');
    } else {
      agregarCandidato(candidatoData);
      toast.success('Candidato agregado exitosamente');
    }

    setShowDialog(false);
    resetForm();
  };

  const handleEdit = (id: string) => {
    const candidato = candidatos.find(c => c.id === id);
    if (candidato) {
      setFormData({
        nombre: candidato.nombre,
        partido: candidato.partido,
        numero: candidato.numero.toString(),
        color: candidato.color || '#3B82F6',
        logo: candidato.logo || '',
      });
      setLogoPreview(candidato.logo || '');
      setEditingId(id);
      setShowDialog(true);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      eliminarCandidato(deleteId);
      toast.success('Candidato eliminado exitosamente');
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
          <h1 className="text-3xl font-bold text-slate-800">Gestión de Candidatos</h1>
          <p className="text-slate-600 mt-1">Administre los candidatos del proceso electoral</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Candidato
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
                Los candidatos creados aquí serán utilizados automáticamente en los formularios 
                de registro de actas de los personeros. Asegúrese de configurar todos los candidatos 
                antes de iniciar el proceso electoral.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Candidatos */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Users className="w-5 h-5 text-blue-600" />
            Lista de Candidatos ({candidatos.length})
          </CardTitle>
          <CardDescription>
            Candidatos ordenados por número
          </CardDescription>
        </CardHeader>
        <CardContent>
          {candidatos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">No hay candidatos registrados</p>
              <p className="text-sm text-slate-400">Agregue el primer candidato usando el botón superior</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">N°</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Logo</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Nombre del Candidato</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Partido Político</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Color</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {[...candidatos].sort((a, b) => a.numero - b.numero).map((candidato) => (
                    <tr key={candidato.id} className="border-b border-slate-100 hover:bg-slate-50" style={{ borderLeftColor: candidato.color, borderLeftWidth: '4px' }}>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold" style={{ backgroundColor: candidato.color || '#3B82F6' }}>
                          {candidato.numero}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {candidato.logo ? (
                          <img src={candidato.logo} alt={candidato.nombre} className="h-8 w-8 object-contain" />
                        ) : (
                          <span className="text-xs text-slate-400">Sin logo</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-800">{candidato.nombre}</td>
                      <td className="py-4 px-4 text-slate-600">{candidato.partido}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-6 h-6 rounded border" style={{ backgroundColor: candidato.color || '#3B82F6' }}></div>
                          <span className="text-xs text-slate-500 font-mono">{candidato.color || '#3B82F6'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(candidato.id)}
                            className="gap-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(candidato.id)}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              {editingId ? 'Editar Candidato' : 'Nuevo Candidato'}
            </DialogTitle>
            <DialogDescription>
              Complete todos los campos obligatorios para {editingId ? 'actualizar' : 'registrar'} el candidato.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-slate-700">
                Nombre del Candidato <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Juan Pérez García"
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
              <Label htmlFor="partido" className="text-slate-700">
                Partido Político <span className="text-red-500">*</span>
              </Label>
              <Input
                id="partido"
                value={formData.partido}
                onChange={(e) => setFormData({ ...formData, partido: e.target.value })}
                placeholder="Ej: Partido Democrático"
                className={errors.partido ? 'border-red-500' : 'border-slate-300'}
              />
              {errors.partido && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.partido}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero" className="text-slate-700">
                Número del Candidato <span className="text-red-500">*</span>
              </Label>
              <Input
                id="numero"
                type="number"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder="Ej: 1"
                min="1"
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
              <Label htmlFor="color" className="text-slate-700">
                Color de Referencia (Hex)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 p-1 border-slate-300"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1 border-slate-300"
                />
              </div>
              <p className="text-xs text-slate-500">Este color se mostrará en los gráficos y tablas del dashboard</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo" className="text-slate-700">
                Logo Político (opcional)
              </Label>
              <div className="space-y-2">
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-slate-500">Sube una imagen (PNG, JPG, GIF, etc.)</p>
              </div>
              {logoPreview && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-2">Vista previa:</p>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                    <img src={logoPreview} alt="Vista previa" className="h-12 w-12 object-contain" />
                    <div className="text-xs text-slate-600">
                      <p className="font-medium">Logo cargado</p>
                      <p className="text-slate-500">Tamaño: {logoPreview.length > 1000 ? (logoPreview.length / 1024).toFixed(1) + ' KB' : logoPreview.length + ' B'}</p>
                    </div>
                  </div>
                </div>
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
              ¿Está seguro que desea eliminar este candidato? Esta acción no se puede deshacer.
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
