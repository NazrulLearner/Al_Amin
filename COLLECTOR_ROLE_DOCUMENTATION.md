# Collector Role System Documentation

## Overview
The **Collector Role** system allows organization administrators to assign members as fee collectors. When a member is assigned as a collector, their role in Firebase is automatically updated to give them proper permissions and access to collector-specific features.

---

## 📋 How It Works

### 1️⃣ **Role Assignment** (Settings → Collector Settings)

**Location:** `src/modules/settings/components/CollectorSettings.tsx`

When an admin assigns a member as a collector:

```typescript
// What happens:
1. Member is added to `collectorSettings.collectors` array in somity_settings
2. Member's Firebase `membership.role` field is updated to 'collector'
3. Member gets automatic access to collector features

// Database Updates:
- Collection: `somity_settings/config`
  Path: `collection.collectorSettings.collectors[]`
  
- Collection: `members/{memberId}`
  Path: `membership.role` = 'collector'
```

### 2️⃣ **Permission System**

**File:** `src/types/common.ts`

```typescript
export type UserRole = 'super_admin' | 'admin' | 'cashier' | 'manager' | 
                       'accountant' | 'collector' | 'member';
```

The `collector` role is part of the UserRole type system and used throughout the app for:
- Route protection via `ProtectedRoute` component
- Sidebar menu filtering
- Dashboard redirects
- Feature access control

### 3️⃣ **Navigation & Dashboard**

**Sidebar Menu** (`src/shared/components/layout/Sidebar.tsx`)
```
Collections Menu (Collector-only)
├── Collector Dashboard (/collector/dashboard)
├── Collection History (/collector/history)
├── My Performance (/collector/performance)
└── Pending Collections (/collector/pending)
```

**Dashboard Redirect** (`src/app/routes/DashboardRedirect.tsx`)
- When collector logs in → redirects to `/collector/dashboard`

### 4️⃣ **Route Protection**

**File:** `src/App.tsx`

Collector routes are protected with role-based access control:

```typescript
<Route path="collector/dashboard" element={
  <ProtectedRoute allowedRoles={['collector']}>
    <CollectorDashboard />
  </ProtectedRoute>
} />
```

**Available Collector Routes:**
- `/collector/dashboard` - Main collector dashboard
- `/collector/history` - View collection history
- `/collector/performance` - Performance metrics and reports
- `/collector/pending` - Pending fees to collect

---

## 🔄 How Role Updates Work

### Adding a Collector

```typescript
// File: CollectorSettings.tsx - handleAddCollector()

const handleAddCollector = async () => {
  // 1. Add to settings
  updateSettings({
    collection: {
      collectorSettings: {
        collectors: [...collectors, newCollector]
      }
    }
  });

  // 2. Update Firebase member role
  const memberRef = collections.member(selectedMember.id);
  await updateDoc(memberRef, {
    'membership.role': 'collector',
    'metadata.updatedAt': new Date(),
  });
};
```

**Database Result:**
```json
{
  "membership": {
    "role": "collector"  // ← Updated from "member"
  },
  "metadata": {
    "updatedAt": "2026-05-11T..."
  }
}
```

### Removing a Collector

```typescript
// File: CollectorSettings.tsx - handleRemoveCollector()

const handleRemoveCollector = async (collectorId: string) => {
  // 1. Revert Firebase role to member
  await updateDoc(memberRef, {
    'membership.role': 'member',  // ← Reverted
    'metadata.updatedAt': new Date(),
  });

  // 2. Remove from settings
  updateSettings({
    collection: {
      collectorSettings: {
        collectors: [...remaining collectors]
      }
    }
  });
};
```

---

## 📊 Collector Features

### Dashboard Components
- **Collector Dashboard** (`src/modules/dashboards/pages/CollectorDashboard.tsx`)
  - Overview of collections
  - Summary statistics
  - Performance indicators

### Collection Management
- **Fee History** - Reuses `FeeHistory` component
  - Filtered by collector
  - Shows all collections made by this collector
  
- **Pending Collections** - Reuses `PendingFees` component
  - Shows outstanding fees
  - Members to collect from

- **Performance Report** - Reuses `FeeReports` component
  - Collection statistics
  - Performance metrics

---

## 🔐 Security & Access Control

### Role-Based Access
- **ProtectedRoute** checks if user has allowed role before rendering
- Unauthorized access redirects to appropriate dashboard
- Role validation happens on both client and server (Firestore rules)

### Data Filtering
In fee-related services, filters can check for collector role:
```typescript
// Example: Show only this collector's transactions
if (userData.role === 'collector') {
  query = where('collector.id', '==', userId);
}
```

---

## 📁 Files Modified/Created

### Core Changes:
1. **CollectorSettings.tsx** - Firebase role updates on assign/remove
2. **Sidebar.tsx** - Collector menu items + role display
3. **App.tsx** - Collector routes
4. **DashboardRedirect.tsx** - Collector dashboard redirect
5. **ProtectedRoute.tsx** - Collector redirect on unauthorized access

### Type Definitions:
- **common.ts** - Already includes 'collector' in UserRole type
- **collector.ts** - CollectorAssignment and CollectorConfig types

---

## 🚀 How to Use

### Step 1: Assign a Collector
1. Go to **Settings → General Settings**
2. Find **"Collector Settings"** tab
3. Click **"নতুন কালেক্টর যোগ করুন"** (Add New Collector)
4. Select member from list
5. Click confirm

**Result:** Member's role in Firebase → `'collector'`

### Step 2: Collector Login
1. Member logs in with their account
2. System detects `role === 'collector'`
3. Automatically redirected to `/collector/dashboard`
4. Sees "Collections" menu in sidebar

### Step 3: Collector Features
- View pending fees to collect
- See collection history
- Check performance metrics
- Monitor pending collections

### Step 4: Remove Collector
1. In Collector Settings, click delete (🗑️) button
2. Confirmation happens
3. Member's role reverted to `'member'`
4. Access to collector features removed

---

## 🔧 Customization

### Add New Collector Features

1. **Create new page** in `src/modules/collectors/pages/`
2. **Add route** in `App.tsx`:
   ```typescript
   <Route path="collector/new-feature" element={
     <ProtectedRoute allowedRoles={['collector']}>
       <NewFeaturePage />
     </ProtectedRoute>
   } />
   ```
3. **Add menu item** in `Sidebar.tsx`:
   ```typescript
   if (currentUserRole === 'collector') {
     baseMenu.push({
       children: [
         { name: "New Feature", path: "/collector/new-feature", ... }
       ]
     });
   }
   ```

### Add Collector Permission to Existing Feature

Simply add `'collector'` to the roles array:
```typescript
// Sidebar example:
{ 
  name: "Reports", 
  path: "/reports/index", 
  roles: ['admin', 'cashier', 'collector'] 
}
```

---

## 📝 Database Schema

### Member Document
```json
{
  "id": "member_123",
  "memberId": "MEM-001",
  "fullName": "John Doe",
  "membership": {
    "role": "collector",  // ← Key field
    "status": "active",
    "dateOfJoin": "2024-01-15"
  },
  "metadata": {
    "updatedAt": "2026-05-11T10:30:00Z",
    "updatedBy": "system"
  }
}
```

### Somity Settings Document
```json
{
  "collection": {
    "collectorSettings": {
      "enabled": true,
      "collectors": [
        {
          "id": "col_1715400000000",
          "memberId": "MEM-001",
          "memberName": "John Doe",
          "phone": "01712345678",
          "isActive": true,
          "joinedAt": "2026-05-11T10:30:00Z",
          "assignedAreas": ["Area A", "Area B"]
        }
      ]
    }
  }
}
```

---

## ⚠️ Important Notes

1. **Dual Storage**: Collector information is stored in TWO places:
   - `somity_settings.collection.collectorSettings.collectors[]` - Settings/Config
   - `members.{memberId}.membership.role` - Permission/Access

2. **Synchronization**: When removing a collector, both storages must be updated to keep them in sync

3. **Inactive vs Removed**:
   - **Inactive** (`isActive: false`): Still assigned but can't collect
   - **Removed**: Completely unassigned, role reverted to 'member'

4. **Role Hierarchy**: 
   - `super_admin` > `admin` > `cashier` > `collector`/`member`
   - Collectors have limited access compared to admin/cashier

---

## 📞 Support

For questions about the collector role system, refer to:
- `CollectorSettings.tsx` - Role assignment logic
- `Sidebar.tsx` - Menu configuration
- `src/types/collector.ts` - Type definitions
- Firebase Firestore rules - Server-side permission checks
