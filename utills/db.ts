import { openDatabaseAsync } from "expo-sqlite";
import { Cashbook } from "@/data/cashbooks";
import { Transaction } from "@/data/cashbooks";

export const getDB = async () => {
  return await openDatabaseAsync("cashbook.db", {
    useNewConnection: true,
  });
};

export const initDB = async () => {
  const db = await getDB();
  try {
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS cashbooks(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL, 
                totalIn REAL DEFAULT 0,
                totalOut REAL DEFAULT 0,
                netBalance REAL DEFAULT 0
            );`
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS transactions(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cashbook_id INTEGER NOT NULL,
        description TEXT,
        type TEXT CHECK(type IN ('cash in','cash out')) NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY(cashbook_id) REFERENCES cashbooks(id) ON DELETE CASCADE
    );`
    );

    console.log("Cashbooks and Transactions DB Created Successfully");
  } catch (error) {
    console.log("DB Creation Failed", error);
  }
};

// Cashbook Database
export const insertCashbook = async (name: string) => {
  const db = await getDB();

  try {
    await db.runAsync(
      `INSERT INTO cashbooks(name,totalIn,totalOut,netBalance) VALUES(?,?,?,?);`,
      name,
      0,
      0,
      0
    );
    console.log("Cashbook Inserted Successfully");
  } catch (error) {
    console.log("Error inserting cashbook", error);
  }
};

export const fetchCashbooks = async (): Promise<Cashbook[]> => {
  const db = await getDB();

  const result = await db.getAllAsync<Cashbook>(
    `SELECT * FROM cashbooks ORDER BY id DESC;`
  );
  return result;
};

// Transactions Database

export const fetchTransactionByCashbookId = async ({
  cashbook_id,
}: {
  cashbook_id: number;
}): Promise<Transaction[]> => {
  const db = await getDB();

  try {
    const result = await db.getAllAsync<Transaction>(
      `SELECT * FROM transactions WHERE cashbook_id = ? ORDER BY date DESC;`,
      cashbook_id
    );

    console.log("Returning All Transactions");
    return result;
  } catch (error) {
    console.log("Fetching All Transaction Failed : ", error);
    return [];
  }
};

export const insertTransaction = async ({
  cashbook_id,
  description,
  type,
  amount,
  date,
}: {
  cashbook_id: number;
  description: string;
  type: "cash in" | "cash out";
  amount: number;
  date: Date;
}) => {
  const db = await getDB();

  try {
    await db.runAsync(
      "INSERT INTO transactions(cashbook_id,description,type,amount,date) VALUES(?,?,?,?,?);",
      cashbook_id,
      description,
      type,
      amount,
      date.toISOString()
    );
    // 🔄 Update cashbook totals after insert
    const totals = await db.getFirstAsync<{
      totalIn: number;
      totalOut: number;
    }>(
      `
      SELECT 
        SUM(CASE WHEN type = "cash in" THEN amount ELSE 0 END) as totalIn,
        SUM(CASE WHEN type = "cash out" THEN amount ELSE 0 END) as totalOut
      FROM transactions
      WHERE cashbook_id = ?;
      `,
      cashbook_id
    );

    const totalIn = totals?.totalIn ?? 0;
    const totalOut = totals?.totalOut ?? 0;
    const netBalance = totalIn - totalOut;

    await db.runAsync(
      `UPDATE cashbooks SET totalIn = ?, totalOut = ?, netBalance = ? WHERE id = ?;`,
      totalIn,
      totalOut,
      netBalance,
      cashbook_id
    );

    console.log("Transaction Inserted and Totals Updated Successfully");
  } catch (error) {
    console.log("Transaction Insertion Failed : ", error);
  }
};

// type incomeSpentResult = {
//   totalIncome: number | null;
//   totalSpent: number | null;
// };

// export const getTotalIncomeAndSpentAmount = async (): Promise<{
//   totalIncome: number;
//   totalSpent: number;
// }> => {
//   const db = await getDB();

//   const incomeResult = await db.getFirstAsync<incomeSpentResult>(
//     `SELECT SUM(totalIn) AS totalIncome
//      FROM cashbooks ;`
//   );
//   const spentResult = await db.getFirstAsync<incomeSpentResult>(
//     `SELECT SUM(totalOut) AS totalSpent
//      FROM cashbooks ;`
//   );

//   return {
//     totalIncome: incomeResult?.totalIncome ?? 0,
//     totalSpent: spentResult?.totalSpent ?? 0,
//   };
// };

type incomeSpentResult = {
  totalIncome: number | null;
  totalSpent: number | null;
};

export const getTotalIncomeAndSpentAmount = async (): Promise<{
  totalIncome: number;
  totalSpent: number;
}> => {
  const db = await getDB();

  const result = await db.getFirstAsync<incomeSpentResult>(
    `
    SELECT
      SUM(CASE WHEN type = 'cash in' THEN amount ELSE 0 END) as totalIncome,
      SUM(CASE WHEN type = 'cash out' THEN amount ELSE 0 END) as totalSpent
    FROM transactions;
    `
  );

  return {
    totalIncome: result?.totalIncome ?? 0,
    totalSpent: result?.totalSpent ?? 0,
  };
};

export const fetchCashbooksWithBalance = async (): Promise<
  {
    id: number;
    name: string;
    totalIn: number;
    totalOut: number;
    netBalance: number;
  }[]
> => {
  const db = await getDB();

  const result = await db.getAllAsync<{
    id: number;
    name: string;
    totalIn: number | null;
    totalOut: number | null;
  }>(
    `
    SELECT c.id,c.name,
    SUM(CASE WHEN t.type = "cash in" THEN t.amount ELSE 0 END) AS totalIn,
    SUM(CASE WHEN t.type = "cash out" THEN t.amount ELSE 0 END) AS totalOut
    FROM cashbooks AS c
    LEFT JOIN transactions AS t
    ON c.id = t.cashbook_id
    GROUP BY c.id
    ORDER BY c.id DESC;
    `
  );

  return result.map((r) => ({
    ...r,
    totalIn: r.totalIn ?? 0,
    totalOut: r.totalOut ?? 0,
    netBalance: (r.totalIn ?? 0) - (r.totalOut ?? 0),
  }));
};

export const dropAllTables = async () => {
  const db = await getDB();

  try {
    await db.execAsync(`DROP TABLE IF EXISTS transactions;`);
    await db.execAsync(`DROP TABLE IF EXISTS cashbooks;`);
    console.log(" Dropped all tables.");
  } catch (error) {
    console.log("Failed Dropping all tables : ", error);
  }
};

export const renameCashbookName = async ({
  name,
  id,
}: {
  name: string;
  id: number;
}) => {
  const db = await getDB();

  try {
    await db.runAsync(`UPDATE cashbooks SET name = ? WHERE id = ?;`, name, id);
    console.log("Renaming Cashbook Success");
  } catch (error) {
    console.log("Renaming Cashbook failed");
  }
};

export const deleteCashbookById = async ({ id }: { id: number }) => {
  const db = await getDB();

  try {
    await db.runAsync(`DELETE FROM cashbooks WHERE id = ?;`, id);
    console.log("Cashbook DELETED Successfully");
  } catch (error) {
    console.log("Cashbook DELETION failed", error);
  }
};
