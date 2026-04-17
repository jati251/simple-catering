import PocketBase from "pocketbase";
import { MenuItem, CalendarItem, OrderItem } from "@/types/pocketbase";
import { getWIBDateString, getTomorrowWIBString } from "./utils";

const PB_URL =
  process.env.NODE_ENV === "production" ? "/" : "http://192.168.1.220:8090";

export const pb = new PocketBase(PB_URL);

pb.autoCancellation(false);

// --- AUTH ---
export const loginAdmin = async (username?: string, password?: string) => {
  if (!username || !password) return null;
  return await pb.collection("users").authWithPassword(username, password);
};

// --- CLEANUP ---
/**
 * Deletes calendar entries and orders that are strictly before today (WIB).
 */
export const cleanupExpiredData = async () => {
  const todayStr = getWIBDateString();

  try {
    // 1. Find expired calendar items (including today as per request)
    const expiredCalendar = await pb
      .collection("calendar")
      .getFullList<CalendarItem>({
        filter: `date <= "${todayStr}"`,
        requestKey: null,
      });

    // 2. Delete them (and their related orders)
    for (const item of expiredCalendar) {
      // Find orders for this expired schedule
      const orders = await pb.collection("orders").getFullList({
        filter: `calendar_id = "${item.id}"`,
        requestKey: null,
      });

      // Delete orders first
      for (const order of orders) {
        await pb.collection("orders").delete(order.id);
      }

      // Delete calendar item
      await pb.collection("calendar").delete(item.id);
    }
  } catch (err) {
    console.error("Cleanup failed:", err);
  }
};

// --- PUBLIC ---
export const getMenuByDateString = async (
  dateStr: string,
): Promise<CalendarItem[]> => {
  try {
    return await pb
      .collection("calendar")
      .getFullList<CalendarItem>({
        filter: `date ~ "${dateStr}"`,
        expand: "menu_item",
        requestKey: null,
      });
  } catch (err) {
    return [];
  }
};

export const getTomorrowMenu = async (): Promise<CalendarItem[]> => {
  const tomorrowStr = getTomorrowWIBString();
  return getMenuByDateString(tomorrowStr);
};

export const createOrder = async (
  userName: string,
  calendarId: string,
): Promise<OrderItem> => {
  return await pb.collection("orders").create<OrderItem>({
    buyer_name: userName,
    calendar_id: calendarId,
  });
};

export const getTomorrowOrders = async (): Promise<OrderItem[]> => {
  try {
    const tomorrowMenus = await getTomorrowMenu();
    if (tomorrowMenus.length === 0) return [];

    const filter = tomorrowMenus.map(m => `calendar_id = "${m.id}"`).join(" || ");

    return await pb.collection("orders").getFullList<OrderItem>({
      filter: `(${filter})`,
      expand: "calendar_id,calendar_id.menu_item",
      requestKey: null,
    });
  } catch (err) {
    return [];
  }
};

// --- ADMIN ---
export const getMenuItems = async (): Promise<MenuItem[]> => {
  return await pb.collection("menu_items").getFullList<MenuItem>({
    sort: "-created",
    requestKey: null,
  });
};

export const addMenuItem = async (formData: FormData): Promise<MenuItem> => {
  return await pb.collection("menu_items").create<MenuItem>(formData);
};

export const deleteMenuItem = async (id: string): Promise<boolean> => {
  return await pb.collection("menu_items").delete(id);
};

export const setFoodForDate = async (
  date: string,
  menuItemId: string,
): Promise<CalendarItem> => {
  // Now allows multiple items by always creating a new entry
  // unless the exact same menu item is already set for that date
  try {
    const existing = await pb
      .collection("calendar")
      .getFirstListItem<CalendarItem>(`date ~ "${date}" && menu_item = "${menuItemId}"`);
    return existing; // Already exists
  } catch (err) {
    return await pb
      .collection("calendar")
      .create<CalendarItem>({ date: date, menu_item: menuItemId });
  }
};

export const removeFoodFromDate = async (calendarId: string): Promise<boolean> => {
  try {
    // Also delete related orders
    const orders = await pb.collection("orders").getFullList({
      filter: `calendar_id = "${calendarId}"`,
    });
    for (const order of orders) {
      await pb.collection("orders").delete(order.id);
    }
    return await pb.collection("calendar").delete(calendarId);
  } catch (err) {
    return false;
  }
};

export const getImageUrl = (record: MenuItem) => {
  if (!record.image) return null;
  return pb.files.getUrl(record, record.image);
};
