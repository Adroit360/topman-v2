export type BookTypes = {
  id: string;
  title: string;
  image: string | null;
  author: string;
  price: number;
  level: string;
  type: string;
  isAvailable: boolean;
  publisher: {
    id: string;
    name: string;
    reference: string;
  };
};
