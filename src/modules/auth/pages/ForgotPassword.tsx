import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../services/firebase/firebase";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleReset = async (e: any) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <form onSubmit={handleReset} className="bg-white p-8 rounded-2xl shadow-lg w-80">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Reset Password</h2>
        <input type="email" placeholder="Enter your email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border rounded-md p-2 mb-3" />
        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded-md hover:bg-blue-700">Send Reset Link</button>
        <div className="text-sm text-center mt-3">
          <Link to="/login" className="text-blue-600">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}
