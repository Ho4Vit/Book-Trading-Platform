import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import GoogleLogo from "@/assets/google_logo_icon.png";
import LoginImage from "@/assets/login.png";

const LoginPage = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await login(formData.username, formData.password);
        } catch {
            setError("Invalid username or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="bg-[#7ad3f62a] flex rounded-2xl shadow-lg max-w-3xl p-4 w-full">
                {/* Form */}
                <div className="sm:w-1/2 px-10 md:px-16">
                    <h2 className="font-bold text-2xl text-[#4527a5] text-center">Login</h2>
                    <p className="text-sm mt-7 text-[#6c57b1] text-opacity-70 text-center">
                        If you already a member, easily log in
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            className="p-2 mt-8 rounded-xl border"
                            type="text"
                            name="username"
                            placeholder="Your username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <input
                            className="p-2 mt-8 rounded-xl border"
                            type="password"
                            name="password"
                            placeholder="Your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl text-white py-2 bg-indigo-500 hover:bg-indigo-600 transition-all"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="mt-10 grid grid-cols-3 items-center text-gray-400">
                        <hr className="border-gray-400" />
                        <p className="text-center text-sm">OR</p>
                        <hr className="border-gray-400" />
                    </div>

                    <button className="bg-white border py-2 w-full rounded-xl mt-5 flex justify-center text-sm items-center hover:bg-gray-100">
                        <img className="w-6 mr-3" src={GoogleLogo} alt="Google logo" />
                        Login with Google
                    </button>
                </div>

                {/* Image */}
                <div className="sm:block hidden w-1/2">
                    <img className="rounded-2xl object-cover h-full w-full" src={LoginImage} alt="login" />
                </div>
            </div>
        </section>
    );
};

export default LoginPage;
