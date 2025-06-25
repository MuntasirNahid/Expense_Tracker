export type Cashbook = {
  id: number;
  name: string;
  totalIn: number;
  totalOut: number;
  netBalance: number;
};

export type Transaction = {
  id: number;
  cashbook_id: number;
  description: string;
  type: string;
  amount: number;
  date: string;
};
