import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CustomerLayout() {
	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<Header />

			{/* Main Content */}
			<main className="flex-1 w-full">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<Outlet />
				</div>
			</main>

			{/* Footer */}
			<Footer />
		</div>
	);
}
