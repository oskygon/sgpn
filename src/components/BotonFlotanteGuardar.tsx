import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BotonFlotanteGuardar = ({ onClick, saving }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button 
        onClick={onClick} 
        className="rounded-full h-14 w-14 shadow-lg flex items-center justify-center bg-medical-600 hover:bg-medical-700/90"
        disabled={saving}
      >
        <Save className={saving ? "animate-pulse" : ""} size={24} />
      </Button>
    </div>
  );
};

export default BotonFlotanteGuardar;