import React, { useState } from 'react';
import { useElectoral } from '@/app/context/ElectoralContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export function Login() {
  const { login } = useElectoral();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!dni || !password) {
      setError('Por favor, complete todos los campos');
      return;
    }

    const success = login(dni, password);
    if (!success) {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Sistema Electoral
          </CardTitle>
          <CardDescription className="text-slate-600">
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dni" className="text-slate-700">
                DNI / Usuario
              </Label>
              <Input
                id="dni"
                type="text"
                placeholder="Ingrese su DNI"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="border-slate-300 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-slate-300 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
            >
              Iniciar Sesión
            </Button>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center mb-3">
                Credenciales de prueba:
              </p>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <strong>Administrador:</strong> admin / admin
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <strong>Administrador (Nuevo):</strong> admin2 / admin@2025
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <strong>Personero:</strong> 12345678 / 1234
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <strong>Personero (Nuevo):</strong> 87654321 / segura123
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <strong>Personero (Nuevo):</strong> 98765432 / abc12345
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
