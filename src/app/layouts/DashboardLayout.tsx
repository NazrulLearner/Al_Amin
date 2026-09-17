// src/app/layouts/DashboardLayout.tsx
// এই ফাইলটি পুরো অ্যাপের লেআউট নিয়ন্ত্রণ করে। এখানে সাইডবার ও টপবার থাকে।

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout: React.FC = () => {
  // ===== স্টেট ডিক্লেয়ারেশন =====
  // sidebarOpen: সাইডবার খোলা/বন্ধ থাকবে কিনা
  // ডেস্কটপে ডিফল্ট ওপেন, মোবাইলে বন্ধ
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // window.innerWidth দিয়ে স্ক্রিনের সাইজ চেক করি
    return window.innerWidth >= 1024; // 1024px = ডেস্কটপ ব্রেকপয়েন্ট
  });

  // isMobile: ডিভাইসটি মোবাইল কিনা (স্ক্রিন < 1024px)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // ===== উইন্ডো রিসাইজ হ্যান্ডলার =====
  // যখন ইউজার ব্রাউজারের সাইজ পরিবর্তন করে, তখন এই ফাংশন কাজ করবে
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // ডেস্কটপে সাইডবার খোলা থাকবে, মোবাইলে বন্ধ
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // ইভেন্ট লিসেনার যোগ করি
    window.addEventListener('resize', handleResize);
    
    // ক্লিনআপ ফাংশন (কম্পোনেন্ট আনমাউন্ট হলে ইভেন্ট রিমুভ করি)
    return () => window.removeEventListener('resize', handleResize);
  }, []); // খালি array মানে শুধু একবার রান করবে

  // ===== সাইডবার টগল ফাংশন =====
  // এই ফাংশন টপবারের হ্যামবার্গার বাটনে ক্লিক করলে কাজ করবে
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    // ===== মূল কন্টেইনার =====
    // flex: ফ্লেক্সবক্স লেআউট
    // h-screen: পুরো স্ক্রিন উচ্চতা
    // overflow-hidden: কন্টেন্ট overflow হলে লুকাবে (স্ক্রল নিজেরাই ম্যানেজ করব)
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* ===== সাইডবার (বাম পাশে) ===== */}
      {/* মোবাইলে fixed + overlay, ডেস্কটপে relative */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:z-auto
        `}
      >
        {/* isOpen এবং toggleSidebar প্রপস পাঠাচ্ছি */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* ===== মোবাইলে ওভারলে ব্যাকড্রপ ===== */}
      {/* সাইডবার খোলা থাকলে এবং মোবাইলে থাকলে একটি অর্ধস্বচ্ছ ব্যাকগ্রাউন্ড দেখাবে */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar} // ব্যাকড্রপে ক্লিক করলে সাইডবার বন্ধ হবে
        />
      )}

      {/* ===== ডান পাশের কন্টেন্ট এরিয়া ===== */}
      {/* flex-1: বাকি জায়গা নেবে */}
      {/* flex-col: কন্টেন্ট উল্লম্বভাবে সাজাবে (টপবার + মেইন) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* ===== টপবার ===== */}
        {/* toggleSidebar প্রপস পাঠাচ্ছি, যাতে হ্যামবার্গার কাজ করে */}
        <Topbar toggleSidebar={toggleSidebar} />

        {/* ===== মেইন কন্টেন্ট ===== */}
        {/* flex-1: বাকি জায়গা নেবে */}
        {/* overflow-y-auto: উল্লম্ব স্ক্রল হবে */}
        {/* p-4: প্যাডিং (মোবাইলে কম, ডেস্কটপে বেশি) */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-5 lg:p-6">
          <Outlet /> {/* এখানে রাউটের কন্টেন্ট রেন্ডার হবে */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;