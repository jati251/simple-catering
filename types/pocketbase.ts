export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // Reverted back to price
  image?: string; // Added image field
  created: string;
  updated: string;
}

export interface CalendarItem {
  id: string;
  date: string;
  menu_item: string;
  expand?: {
    menu_item?: MenuItem;
  };
  created: string;
  updated: string;
}

export interface OrderItem {
  id: string;
  buyer_name: string;
  calendar_id: string;
  notes?: string; 
  expand?: {
    calendar_id?: CalendarItem & {
      expand?: {
        menu_item?: MenuItem;
      }
    };
  };
  created: string;
  updated: string;
}
