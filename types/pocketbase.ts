export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
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
  calendar_item: string;
  quantity: number;
  expand?: {
    calendar_item?: CalendarItem & {
      expand?: {
        menu_item?: MenuItem;
      }
    };
  };
  created: string;
  updated: string;
}

export interface ApiResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
}
