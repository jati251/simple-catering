import PocketBase from "pocketbase";
import { MenuItem, CalendarItem, OrderItem } from "@/types/pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://192.168.1.220:8090";
export const pb = new PocketBase(PB_URL);

// Disable auto-cancel globally for Next.js double-render compatibility
pb.autoCancellation(false);

// --- AUTH LOGIC ---
export const loginAdmin = async (username?: string, password?: string) => {
  // Use 'users' collection for authentication
  if (!username || !password) return null;
  return await pb.collection("users").authWithPassword(username, password);
};

// --- BUYER LOGIC (PUBLIC) ---
export const getMenuByDate = async (date: Date): Promise<CalendarItem | null> => {
  const dateString = date.toISOString().split("T")[0];
  try {
    return await pb
      .collection("calendar")
      .getFirstListItem<CalendarItem>(`date ~ "${dateString}"`, {
        expand: "menu_item",
        requestKey: null,
      });
  } catch (err) {
    return null;
  }
};

export const getTomorrowMenu = async (): Promise<CalendarItem | null> => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getMenuByDate(tomorrow);
};

export const createOrder = async (userName: string, calendarId: string): Promise<OrderItem> => {
  return await pb.collection("orders").create<OrderItem>({
    buyer_name: userName,
    calendar_item: calendarId,
    quantity: 1,
  });
};

// --- PREP LOGIC (TOMORROW'S VIEW) ---
export const getTomorrowOrders = async (): Promise<OrderItem[]> => {
  try {
    const tomorrowMenu = await getTomorrowMenu();
    if (!tomorrowMenu) return [];

    return await pb.collection("orders").getFullList<OrderItem>({
      filter: `calendar_item = "${tomorrowMenu.id}"`,
      expand: "calendar_item,calendar_item.menu_item",
      requestKey: null,
    });
  } catch (err) {
    console.error("Prep fetch error:", err);
    return [];
  }
};

// --- ADMIN LOGIC (PROTECTED) ---
export const getMenuItems = async (): Promise<MenuItem[]> => {
  return await pb.collection("menu").getFullList<MenuItem>({
    sort: "-created",
    requestKey: null,
  });
};

export const addMenuItem = async (data: Partial<MenuItem>): Promise<MenuItem> => {
  return await pb.collection("menu").create<MenuItem>(data);
};

export const deleteMenuItem = async (id: string): Promise<boolean> => {
  return await pb.collection("menu").delete(id);
};

export const setFoodForDate = async (date: string, menuItemId: string): Promise<CalendarItem> => {
  try {
    const existing = await pb
      .collection("calendar")
      .getFirstListItem<CalendarItem>(`date ~ "${date}"`);
    return await pb
      .collection("calendar")
      .update<CalendarItem>(existing.id, { menu_item: menuItemId });
  } catch (err) {
    return await pb
      .collection("calendar")
      .create<CalendarItem>({ date: date, menu_item: menuItemId });
  }
};
