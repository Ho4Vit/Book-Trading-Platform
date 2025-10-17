# 🧩 Project Coding Guide for Copilot

This document defines how Copilot should generate, complete, and refactor code for this project.  
The project follows **React + TailwindCSS + Axios + Zustand + React Query + Toastify** architecture.  
Copilot must respect the structure, style, and conventions described below.

---

## 🏗️ Project Stack

| Layer | Library / Tool | Purpose |
|--------|----------------|----------|
| UI | **React + TailwindCSS** | Component styling |
| HTTP | **Axios** | Request handling |
| API Wrapper | **apiClient** | Unified REST handler with toast + error handling |
| State | **Zustand** | Auth & global state management |
| Data Fetching | **React Query** | Caching, refetch, query invalidation |
| Notification | **React Hot Toast** | Success / error feedback |
| Routing | **React Router v6+** | Page navigation and protection |

---

## 📁 Folder Structure

```
src/
 ├── api/
 │   ├── axiosInstance.js
 │   ├── apiClient.js
 │   ├── authApi.js
 │   ├── bookApi.js
 │   ├── orderApi.js
 │   ├── ...
 │   └── index.js
 │
 ├── store/
 │   └── authStore.js          # Zustand store (no AuthContext needed)
 │
 ├── hooks/
 │   ├── useCustomQuery.js
 │   ├── useCustomMutation.js
 │   └── useFetch.js
 │
 ├── routes/
 │   ├── AppRoutes.jsx
 │   └── ProtectedRoute.jsx
 │
 ├── components/
 │   ├── LoginModal.jsx
 │   └── ...
 │
 ├── pages/
 │   ├── LoginPage.jsx
 │   ├── Dashboard.jsx
 │   └── ...
 │
 ├── App.jsx
 └── main.jsx
```

---

## ⚙️ API Layer Convention

### `axiosInstance.js`
- Configures **baseURL**, **timeout**, **token interceptor**, and **auto logout** on 401.
- Never call `fetch` directly; always use Axios instance.

### `apiClient.js`
- Wraps `axiosInstance` and provides **REST helpers** (`get`, `post`, `put`, `patch`, `delete`).
- Handles:
  - Toast success/error messages
  - Multipart form uploads
  - Token expiration → calls `authStore.logout()`
- Example:
  ```js
  import { apiClient } from "@/api";
  const data = await apiClient.get("/books");
  ```

### `index.js`
- Central export hub:
  ```js
  export * from "./authApi";
  export * from "./bookApi";
  export { apiClient } from "./apiClient";
  export { default as axiosInstance } from "./axiosInstance";
  ```
- Always use named exports (`export const`, not `export default`).

---

## 🔐 Auth Management (Zustand)

- File: `src/store/authStore.js`
- Handles `login`, `logout`, and token persistence via Zustand’s `persist` middleware.
- React Context (AuthContext) **is not used**.
- Example:
  ```js
  import { useAuthStore } from "@/store/authStore";

  const { userId, token, role, login, logout } = useAuthStore();
  ```

---

## 🚀 Data Fetching (React Query)

### `useCustomQuery.js`
- Wraps `useQuery` with:
  - Built-in error handling via toast
  - Auto-refetch on focus / reconnect
- Example:
  ```js
  const { data, isLoading } = useCustomQuery(["sellers"], sellerApi.getAllSellers);
  ```

### `useCustomMutation.js`
- Wraps `useMutation` with:
  - Toast on success/error
  - Auto refetch related queries
- Example:
  ```js
  function UpdateSeller({ id }) {
  const mutation = useCustomMutation((data) => sellerApi.updateSeller(id, data));

  const handleClick = () => {
    mutation.mutate({ name: "Updated Seller" });
  };

  return <button onClick={handleClick}>Cập nhật</button>;
  }
  ```

---

## 🧱 UI Components Convention

### General
- Use the shadcn UI component library as a base.
- All text content in Vietnamese.
- Web will use Vietnam dong (đ) for currency.
- TailwindCSS for all styling (no inline CSS).
- Use utility classes with consistent spacing & color scale.
- Keep responsive behavior (e.g. `sm:`, `md:`, `lg:`).

### Example: `LoginModal.jsx`
- Uses:
  - `authApi.login()` for authentication
  - `authStore.login()` to save userId
  - Toast notifications for feedback
  - `navigate()` for role-based redirect
- Role redirect pattern:
  ```js
  switch (res.role) {
    case "CUSTOMER":
      navigate("/customer/home");
      break;
    case "SELLER":
      navigate("/seller/dashboard");
      break;
    case "ADMIN":
      navigate("/admin/dashboard");
      break;
    default:
      navigate("/");
  }
  ```

---

## 🧠 Code Style Guide

### ✅ Use:
- `async/await` syntax for API calls.
- Named exports for all modules.
- Destructured imports (`{ apiClient }`).
- React functional components.
- Tailwind utility-first CSS.
- `toast.success()` / `toast.error()` for all feedback.

### ❌ Avoid:
- `AuthContext` (Zustand replaces it).
- Inline styles or `styled-components`.
- Direct calls to `axios` without using `axiosInstance` or `apiClient`.
- Default exports for APIs (always use named exports).

---

## 🧩 Routing Standards
- Use React Router v6+.
- Routes defined in `AppRoutes.jsx`.
- Protected routes handled by `ProtectedRoute.jsx`:
  - Reads `token` and `role` from Zustand.
  - Redirects to `/login` if unauthenticated.

Example:
```jsx
<Route
  path="/admin/*"
  element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>}
/>
```

---

## 🔥 Toastify Rules
- Always give userId feedback on:
  - Successful API call → `toast.success("Thao tác thành công!")`
  - Failed API call → `toast.error("Đã xảy ra lỗi.")`
- Never silently fail an async operation.

---

## 🧩 Role Management (Example)
| Role | Redirect Path | Access Level |
|------|----------------|--------------|
| ADMIN | `/admin/dashboard` | Full |
| SELLER | `/seller/dashboard` | Manage products |
| CUSTOMER | `/customer/home` | Book / Order |

---

## 🧠 Best Practices Summary

- `axiosInstance` → HTTP config only  
- `apiClient` → REST logic, toast, errors  
- `authApi`, `bookApi`, etc. → Business-specific APIs  
- `authStore` → Central auth state  
- `useCustomQuery` / `useCustomMutation` → React Query integration  
- `LoginModal.jsx` → Clean, stateless, async-based  
- No `AuthContext` → Zustand handles everything  

---

## 🧩 Example of Data Flow

```mermaid
flowchart LR
A[LoginModal.jsx] --> B[authApi.login()]
B --> C[apiClient.post()]
C --> D[axiosInstance]
D --> E[(Backend API)]
E --> D --> C --> B
B --> F[authStore.login()]
F --> G[ProtectedRoute]
G --> H[Dashboard]
```

---

## ✅ Copilot Behavior Rules

Copilot should:
- Suggest REST calls via `apiClient`, not raw `axios`.
- Use `toast` for all async feedback.
- Use `useAuthStore` for login/logout state.
- Prefer named exports.
- Follow Tailwind styling conventions.
- Keep components functional & stateless when possible.
- Use consistent file naming: `PascalCase` for components, `camelCase` for helpers.

---

> 🧱 **In short:**  
> Copilot must follow a layered approach:  
> **UI → API Module → apiClient → axiosInstance → Backend**,  
> with Zustand as global state and React Query for data synchronization.
