"use client";

import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/icons';
import { PlusCircle, UserPlus, CreditCard, ShoppingBag, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  onAddPerson: () => void;
  onAddCard: () => void;
  onAddPurchase: () => void;
};

export function Header({ onAddPerson, onAddCard, onAddPurchase }: HeaderProps) {
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <AppLogo className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Card Buddy
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
         <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onAddPerson}>
            <UserPlus className="mr-2 h-4 w-4" />
            Pessoa
          </Button>
          <Button variant="outline" size="sm" onClick={onAddCard}>
            <CreditCard className="mr-2 h-4 w-4" />
            Cartão
          </Button>
        </div>
        <Button onClick={onAddPurchase} size="sm">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Nova Compra
        </Button>
        <div className="md:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onAddPerson}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Adicionar Pessoa</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={onAddCard}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Adicionar Cartão</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Sair">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
