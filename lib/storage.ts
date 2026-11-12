import type {
  Bot,
  Product,
  Order,
  Customer,
  StoreSettings,
  Payment,
} from "./types";

const STORAGE_KEYS = {
  bots: "orderly_bots",
  products: "orderly_products",
  orders: "orderly_orders",
  customers: "orderly_customers",
  payments: "orderly_payments",
  settings: "orderly_settings",
};

function readData<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("ORDERLY: gagal menyimpan data", error);
  }
}

export const storage = {
  getBots: () => readData<Bot[]>(STORAGE_KEYS.bots, []),
  saveBots: (data: Bot[]) => {
    // Token bot tidak disimpan di browser.
    const safeBots = data.map(({ token, ...bot }) => ({
      ...bot,
      token: "",
    }));
    writeData(STORAGE_KEYS.bots, safeBots);
  },

  getProducts: () => readData<Product[]>(STORAGE_KEYS.products, []),
  saveProducts: (data: Product[]) =>
    writeData(STORAGE_KEYS.products, data),

  getOrders: () => readData<Order[]>(STORAGE_KEYS.orders, []),
  saveOrders: (data: Order[]) =>
    writeData(STORAGE_KEYS.orders, data),

  getPayments: () => readData<Payment[]>(STORAGE_KEYS.payments, []),
  savePayments: (data: Payment[]) =>
    writeData(STORAGE_KEYS.payments, data),

  getCustomers: () => readData<Customer[]>(STORAGE_KEYS.customers, []),
  saveCustomers: (data: Customer[]) =>
    writeData(STORAGE_KEYS.customers, data),

  getSettings: (): StoreSettings =>
    readData<StoreSettings>(STORAGE_KEYS.settings, {
      storeName: "Toko Genta",
      storeDescription: "Toko digital ORDERLY",
      supportContact: "",
      currency: "IDR",
    }),

  saveSettings: (data: StoreSettings) =>
    writeData(STORAGE_KEYS.settings, data),
};
