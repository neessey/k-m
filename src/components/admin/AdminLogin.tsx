
import React, { useState } from 'react';
import {
  Lock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import {
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../../services/firebase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToShop: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToShop,
}) => {
  const [email, setEmail] = useState('admin@kmbeauty.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Erreur de connexion :', err);

      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError('Adresse email ou mot de passe incorrect.');
          break;

        case 'auth/invalid-email':
          setError('Adresse email invalide.');
          break;

        case 'auth/too-many-requests':
          setError('Trop de tentatives. Réessayez plus tard.');
          break;

        case 'auth/operation-not-allowed':
          setError('La connexion par email et mot de passe n’est pas activée dans Firebase.');
          break;

        default:
          setError('Impossible de se connecter. Vérifiez votre configuration Firebase.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white border border-[#E8E0D7] p-8 sm:p-10 shadow-lg space-y-6">

        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#765343] font-semibold block">
            Espace Privé
          </span>
          <h1 className="font-serif text-3xl text-[#29231F] font-normal">
            K&M beauty
          </h1>
          <p className="text-xs text-[#8C8178]">
            Connexion au tableau de bord d'administration et de gestion des stocks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
              Adresse Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
              />
              <Lock className="w-4 h-4 text-[#8C8178] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 border border-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 text-xs uppercase tracking-[0.16em] font-medium text-[#FAF8F4] bg-[#29231F] hover:bg-[#765343] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-75"
          >
            <span>
              {isLoading ? 'Connexion en cours...' : 'Accéder au Dashboard'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onBackToShop}
            className="text-xs text-[#8C8178] hover:text-[#29231F] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la boutique publique</span>
          </button>
        </div>
      </div>
    </div>
  );
};
