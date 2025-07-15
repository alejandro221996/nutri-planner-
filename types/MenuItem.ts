export interface MenuItem {
  comida: string;
  receta: string;
  calorias: number;
  macros?: {
    proteina: number;
    carbohidrato: number;
    grasa: number;
  };
  ingredientes?: string[];
  objetivo?: string;
}
