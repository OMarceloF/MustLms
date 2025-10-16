import 'jspdf';
import 'jspdf-autotable';

// src/types/jspdf-autotable.d.ts
declare module 'jspdf' {
    interface jsPDF {
      autoTable: (options: any) => jsPDF;
    }
  }
  
