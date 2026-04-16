# PocketBase Setup Instructions

To get the **CateringGo** app working, you need to set up the following collections in your PocketBase instance (default: `http://127.0.0.1:8090`).

## 1. `menu` Collection
*   **Fields:**
    *   `name` (Plain Text, Required)
    *   `description` (Plain Text)
    *   `price` (Number)
*   **API Rules:**
    *   List/View: `Public`
    *   Create/Update/Delete: `Admins Only`

## 2. `calendar` Collection
*   **Fields:**
    *   `date` (Date, Required)
    *   `menu_item` (Relation to `menu`, Single)
*   **API Rules:**
    *   List/View: `Public`
    *   Create/Update/Delete: `Admins Only`

## 3. `orders` Collection
*   **Fields:**
    *   `buyer_name` (Plain Text, Required)
    *   `calendar_item` (Relation to `calendar`, Single)
    *   `quantity` (Number, default 1)
*   **API Rules:**
    *   List/View: `Public` 
    *   Create: `Public`
    *   Update/Delete: `Admins Only`

---

### Environment Variable
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_POCKETBASE_URL=http://<LXC_IP>:8090
```

### Admin Access
Log in via the `/login` page using your PocketBase **Admin** account (the same one you use to log into the PB dashboard).
