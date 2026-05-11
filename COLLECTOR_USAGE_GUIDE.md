# Collector Role System - Practical Usage Guide

## আপনার প্রশ্নের উত্তর

### Q1: "Settings er collector tab teke memberder select kore collector er kaj dewa hosse, to ader je collector er rules seta tar actual rulse ta te chance update howa dorkar nai na?"

**উত্তর:** ✅ **এটা এখন হচ্ছে!**

যখন আপনি Settings এ কোনো Member কে Collector assign করবেন, তখন:

1. **Firebase এ Member এর role আপডেট হবে:**
   - `members/{memberId}/membership.role` = `'collector'`
   - এই role field টি সব জায়গায় এর permission check করার জন্য ব্যবহার হয়

2. **Settings এও save হবে:**
   - `somity_settings/collection/collectorSettings/collectors[]` array এ যোগ হবে

**কোড দেখুন:** `CollectorSettings.tsx` এর `handleAddCollector()` function

---

### Q2: "R ei collector role kothai kothai add kora lagbe, sidebar, page, dahsboar...."

**উত্তর:** ✅ **সব জায়গায় যোগ করা হয়েছে!**

#### **Sidebar এ Collector Menu:**
```
Collections
├── Collector Dashboard
├── Collection History
├── My Performance
└── Pending Collections
```
**ফাইল:** `Sidebar.tsx` (প্রায় line 380)

#### **Dashboard Redirect:**
Collector এ login করলে → `/collector/dashboard` এ যাবে
**ফাইল:** `DashboardRedirect.tsx`

#### **Routes:**
4টি route যোগ করা হয়েছে:
- `/collector/dashboard` - Main dashboard
- `/collector/history` - Collection history
- `/collector/performance` - Performance reports
- `/collector/pending` - Pending collections
**ফাইল:** `App.tsx`

#### **Access Control:**
সব জায়গায় `ProtectedRoute` দিয়ে protect করা হয়েছে যাতে শুধু collector role এর লোক access পায়

---

### Q3: "Mane ei rokom niom gola actualy kibabe kaj kore ba use hoi...."

**উত্তর:** Role system কিভাবে কাজ করে:

#### **Step 1: Collector Assign করা**
```
Settings → General Settings → Collector Settings tab
  ↓
"নতুন কালেক্টর যোগ করুন" button click
  ↓
Member select করুন
  ↓
Confirm করুন
  ↓
Firebase update হয় (role = 'collector')
```

#### **Step 2: Collector Login করে**
```
Member এর account দিয়ে login করে
  ↓
System check করে: role === 'collector' ?
  ↓
হ্যাঁ → /collector/dashboard এ redirect
  ↓
Sidebar এ "Collections" menu দেখা যায়
```

#### **Step 3: Collector তাদের কাজ করে**
```
Available features:
- Collection History দেখা
- Pending Fees দেখা
- Performance দেখা
- Settings এ তাদের profile edit করা
- Support access
```

#### **Step 4: Collector Remove করা**
```
Settings → Collector Settings
  ↓
Collector এর পাশে Delete button click
  ↓
Firebase role revert: 'collector' → 'member'
  ↓
Settings থেকে remove হয়
  ↓
Member এর collector access চলে যায়
```

---

## 🔧 Technical Details

### Data Structure

**Member Document (Firebase):**
```json
{
  "id": "mem_001",
  "memberId": "MEM-001",
  "fullName": "রহিম আহমেদ",
  "membership": {
    "role": "collector",        // ← এটাই important
    "status": "active",
    "dateOfJoin": "2024-01-15"
  },
  "metadata": {
    "updatedAt": "2026-05-11T10:30:00Z",
    "updatedBy": "system"
  }
}
```

**Settings Document (Firebase):**
```json
{
  "collection": {
    "collectorSettings": {
      "enabled": true,
      "collectors": [
        {
          "id": "col_1715400000000",
          "memberId": "MEM-001",
          "memberName": "রহিম আহমেদ",
          "phone": "01712345678",
          "isActive": true,
          "joinedAt": "2026-05-11T10:30:00Z",
          "assignedAreas": []
        }
      ]
    }
  }
}
```

### Role Type Definition

**File:** `src/types/common.ts`
```typescript
export type UserRole = 
  'super_admin' | 
  'admin' | 
  'cashier' | 
  'manager' | 
  'accountant' | 
  'collector' |  // ← Collector role
  'member';
```

---

## 🎯 How Features Access Collector

### Example: Fee History এ Collector দেখা

```typescript
// In fee history filtering
if (userData.role === 'collector') {
  // শুধু এই collector এর transactions দেখাবে
  query = where('collector.id', '==', userId);
}
```

### Example: Sidebar Menu Filter

```typescript
// Sidebar.tsx
const filteredMenu = menu.filter(item => {
  return item.roles.includes(currentUserRole); // 'collector' check
});

// Collector role থাকলে → Collections menu দেখা যায়
```

### Example: Route Protection

```typescript
// App.tsx
<Route path="collector/dashboard" element={
  <ProtectedRoute allowedRoles={['collector']}>
    <CollectorDashboard />
  </ProtectedRoute>
} />

// Collector না হলে → redirect to appropriate dashboard
```

---

## 🚀 Complete User Journey

### Admin এর দৃষ্টিভঙ্গি

```
1. Settings এ যাই
   ↓
2. Collector Settings খুলি
   ↓
3. সদস্য select করি (রহিম, করিম, ইত্যাদি)
   ↓
4. Confirm করি
   ↓
5. রহিম এখন collector হয়ে গেছে
   ↓
6. রহিম এর role: 'collector' (Firebase এ)
   ↓
7. রহিম কে remove করতে চাই? Delete button click করি
   ↓
8. রহিম এর role: 'member' এ ফিরে যায়
```

### Collector এর দৃষ্টিভঙ্গি

```
1. নিজের অ্যাকাউন্ট দিয়ে login করি
   ↓
2. Dashboard: "Collector Dashboard" দেখি
   ↓
3. Sidebar এ "Collections" menu দেখি
   ↓
4. 4টি option দেখি:
   - Collector Dashboard
   - Collection History
   - My Performance
   - Pending Collections
   ↓
5. Collection History এ যাই → আমার সব collections
   ↓
6. Pending Collections এ যাই → কার কাছ থেকে আরও collect করতে হবে
   ↓
7. My Performance দেখি → কতটা ভালো করছি
   ↓
8. Settings এ logout করি অথবা profile update করি
```

---

## 🔐 Security

### কে কি access পায়:

| Feature | Admin | Cashier | Collector | Member |
|---------|-------|---------|-----------|--------|
| Collector Settings | ✅ | ❌ | ❌ | ❌ |
| Collector Dashboard | ❌ | ❌ | ✅ | ❌ |
| Collection History | ✅ | ✅ | ✅ | ❌ |
| Fee Entry | ✅ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ❌ |
| Member List | ✅ | ✅ | ❌ | ❌ |
| Support | ✅ | ✅ | ✅ | ✅ |

---

## 🛠️ Customization Examples

### Example 1: Add a new Collector Feature

**Step 1: Create page**
```typescript
// src/modules/collectors/pages/CollectorEarnings.tsx
export default function CollectorEarnings() {
  return <div>কালেক্টর এর আয়</div>;
}
```

**Step 2: Add route**
```typescript
// App.tsx
<Route path="collector/earnings" element={
  <ProtectedRoute allowedRoles={['collector']}>
    <CollectorEarnings />
  </ProtectedRoute>
} />
```

**Step 3: Add menu item**
```typescript
// Sidebar.tsx
if (currentUserRole === 'collector') {
  baseMenu.push({
    children: [
      { name: "Earnings", path: "/collector/earnings", roles: ['collector'] },
      // ... other items
    ]
  });
}
```

### Example 2: Allow Collectors to access Reports

```typescript
// Sidebar.tsx
baseMenu.push({
  name: "Reports",
  icon: <FileChartLine size={18} />,
  children: [
    { 
      name: "Collection Reports", 
      path: "/reports/index", 
      roles: ['admin', 'cashier', 'collector'] // ← Add 'collector'
    },
  ],
});
```

---

## 📞 Important Files

| File | Purpose |
|------|---------|
| `CollectorSettings.tsx` | Firebase role update logic |
| `Sidebar.tsx` | Collector menu definition |
| `App.tsx` | Collector routes |
| `DashboardRedirect.tsx` | Collector dashboard redirect |
| `ProtectedRoute.tsx` | Access control |
| `common.ts` | UserRole type definition |
| `collector.ts` | Collector types |

---

## ✅ Verification Checklist

আপনি test করতে পারেন:

- [ ] Settings এ collector assign করলে Firebase update হয়
- [ ] Collector এর role 'collector' হয়
- [ ] Collector login করলে dashboard redirect হয়
- [ ] Sidebar এ Collections menu দেখা যায়
- [ ] 4টি collector route accessible
- [ ] Collector remove করলে role 'member' হয়
- [ ] Role revert হওয়ার পর access lost হয়
- [ ] Error messages সঠিক দেখা যায়

---

## 🎓 Learning Points

এই implementation দেখায় কিভাবে:

1. **Firebase থেকে data fetch করা** (memberService)
2. **Firebase এ data update করা** (updateDoc)
3. **Role-based access control** করা (ProtectedRoute)
4. **Dynamic menu generation** করা (Sidebar)
5. **Proper error handling** করা (try-catch)
6. **User feedback** দেওয়া (toast messages)
7. **Type safety** maintain করা (TypeScript)

---

এখন সবকিছু ready! 🚀 আপনি settings থেকে collector assign করতে পারেন এবং সব কিছু automatically handle হবে।
