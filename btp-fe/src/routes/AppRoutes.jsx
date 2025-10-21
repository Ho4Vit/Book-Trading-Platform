import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

// Lazy load pages
const HomePage = lazy(() => import("../pages/HomePage"));
const BookDetailPage = lazy(() => import("../pages/customer/BookDetailPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const RegisterSeller = lazy(() => import("../pages/RegisterSeller"));
const RegisterCustomer = lazy(() => import("../pages/RegisterCustomer"));

// Layouts
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const SellerLayout = lazy(() => import("../layouts/SellerLayout"));
const CustomerLayout = lazy(() => import("../layouts/CustomerLayout"));

// Pages inside layouts
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const ManageBooks = lazy(() => import("../pages/admin/ManageBooks"));
const ManageUsers = lazy(() => import("../pages/admin/ManageUsers"));
const ManageOrders = lazy(() => import("../pages/admin/ManageOrders"));
const ManageCategories = lazy(() => import("../pages/admin/ManageCategories"));
const ManageSeries = lazy(() => import("../pages/admin/ManageSeries"));

const SellerDashboard = lazy(() => import("../pages/seller/SellerDashboard"));
const SellerBooks = lazy(() => import("../pages/seller/SellerBooks"));
const SellerOrders = lazy(() => import("../pages/seller/SellerOrders"));
const SellerProfile = lazy(() => import("../pages/seller/SellerProfile"));
const SellerInventory = lazy(() => import("../pages/seller/SellerInventory"));

const CustomerDashboard = lazy(() => import("../pages/customer/CustomerDashboard"));
const CustomerProfile = lazy(() => import("../pages/customer/CustomerProfile"));
const CustomerOrders = lazy(() => import("../pages/customer/CustomerOrders"));
const CustomerCart = lazy(() => import("../pages/customer/CustomerCart"));

export default function AppRoutes() {
    return (
        <>
            <ScrollToTop />
            <Suspense
                fallback={
                    <div className="flex justify-center items-center h-screen text-gray-500">
                        Đang tải...
                    </div>
                }
            >
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/books/:id" element={<BookDetailPage />} />
                    <Route path="/register-seller" element={<RegisterSeller />} />
                    <Route path="/register-customer" element={<RegisterCustomer />} />

                    {/* Customer Routes */}
                    <Route
                        path="/customer"
                        element={<ProtectedRoute element={<CustomerLayout />} allowedRoles={["CUSTOMER"]} />}
                    >
                        <Route index element={<CustomerDashboard />} />
                        <Route path="cart" element={<CustomerCart />} />
                        <Route path="profile" element={<CustomerProfile />} />
                        <Route path="orders" element={<CustomerOrders />} />
                    </Route>

                    {/* Seller Routes */}
                    <Route
                        path="/seller"
                        element={<ProtectedRoute element={<SellerLayout />} allowedRoles={["SELLER"]} />}
                    >
                        <Route index element={<SellerDashboard />} />
                        <Route path="books" element={<SellerBooks />} />
                        <Route path="orders" element={<SellerOrders />} />
                        <Route path="profile" element={<SellerProfile />} />
                        <Route path="inventory" element={<SellerInventory />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={<ProtectedRoute element={<AdminLayout />} allowedRoles={["ADMIN"]} />}
                    >
                        <Route index element={<AdminDashboard />} />
                        <Route path="books" element={<ManageBooks />} />
                        <Route path="users" element={<ManageUsers />} />
                        <Route path="orders" element={<ManageOrders />} />
                        <Route path="categories" element={<ManageCategories />} />
                        <Route path="series" element={<ManageSeries />} />
                    </Route>

                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </>
    );
}
