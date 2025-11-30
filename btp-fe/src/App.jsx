// src/App.jsx
import React from "react";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
    return (
        <>
            <AppRoutes />
            <Toaster position="bottom-right" />
        </>
    );
}

export default App;
