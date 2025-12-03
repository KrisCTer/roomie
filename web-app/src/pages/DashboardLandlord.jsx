import React, { useState } from 'react';
import {Heart, Star, Building, Search, Calendar, Filter, Clock } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar.jsx';
import Header from '../components/layout/Header.jsx';
import StatsCard from '../components/layout/StatsCard.jsx';
import ListingCard from '../components/layout/ListingCard.jsx';
import MessageItem from '../components/layout/MessageItem.jsx';
import ReviewItem from '../components/layout/ReviewItem.jsx';

// ========== MAIN DASHBOARD COMPONENT ==========
const DashboardLandlord = () => {
  const [activeMenu, setActiveMenu] = useState('Dashboards');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const listings = [
    { id: 1, title: 'Casa Lomas de Machali Machas', date: 'March 22, 2024', price: '$4,498', status: 'Pending', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300&h=200&fit=crop' },
    { id: 2, title: 'Casa Lomas de Machali Machas', date: 'March 22, 2024', price: '$5,007', status: 'Approved', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop' },
    { id: 3, title: 'Casa Lomas de Machali Machas', date: 'March 22, 2024', price: '$5,329', status: 'Sold', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=200&fit=crop' },
    { id: 4, title: 'Casa Lomas de Machali Machas', date: 'March 22, 2024', price: '$3,882', status: 'Pending', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=200&fit=crop' },
    { id: 5, title: 'Casa Lomas de Machali Machas', date: 'March 22, 2024', price: '$2,895', status: 'Sold', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=300&h=200&fit=crop' },
  ];

  const messages = [
    { id: 1, name: 'Themesflat', time: '1 day ago', message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean scelerisque vulputate ultricies. Maecenas eorm.', avatar: 'TF' },
    { id: 2, name: 'ThemeMu', time: '1 day ago', message: 'Nullam lacinia lorem id sapien suscipit, vitae pellentesque ex facilisis. Duis eu molis odio. Proin faucibus ex lectus a eleifend.', avatar: 'TM' },
    { id: 3, name: 'Cameron Williamson', time: '1 day ago', message: 'In consequat lacus augue, a vestibulum est aliquam non', avatar: 'CW' },
    { id: 4, name: 'Esther Howard', time: '3 day ago', message: 'Cras congue in justo vel dapibus. Praesent euismod, lectus et aliquam pretium', avatar: 'EH' },
  ];

  const reviews = [
    { id: 1, name: 'Bessie Cooper', time: '3 day ago', rating: 5, comment: 'Maecenas eu lorem et urna accumsan vestibulum eml vitae magna.' },
    { id: 2, name: 'Annette Black', time: '3 day ago', rating: 5, comment: 'Nullam rhoncus dolor arcu, et bibendum ligula congue eu. Aenean finibus tristique iuctus, ac lobortis mauris venenatis ac.' },
    { id: 3, name: 'Ralph Edwards', time: '3 day ago', rating: 5, comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus viverra semper convallis. Integer vestibulum tempus tincidunt.' },
    { id: 4, name: 'Jerome Bell', time: '4 day ago', rating: 5, comment: 'Fusce sit amet purus eget quam eleifend hendrerit nec a erat. Sed turpis neque, iaculis blandit viverra ut, dapibus eget nisi.' },
    { id: 5, name: 'Albert Flores', time: '3 day ago', rating: 5, comment: 'Donec bibendum nibh quis nisl luctus, at aliquet ipsum faucibus. Vestibulum tincidunt nulla semper venenatis sit et magna.' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              icon={Building} 
              label="Your listing" 
              value="32" 
              subtitle="remaining"
              bgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatsCard 
              icon={Clock} 
              label="Pending" 
              value="02"
              bgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
            <StatsCard 
              icon={Heart} 
              label="Favorites" 
              value="06"
              bgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
            <StatsCard 
              icon={Star} 
              label="Reviews" 
              value="1.483"
              bgColor="bg-yellow-50"
              iconColor="text-yellow-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* New Listing Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold">New Listing</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 md:flex-none">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search" 
                        className="w-full md:w-auto pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>From Date</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>To Date</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                      <Filter className="w-4 h-4" />
                      <span>Select</span>
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">26 Results found</p>

                <div className="space-y-3">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">&lt;</button>
                  <button className="w-9 h-9 flex items-center justify-center rounded bg-blue-600 text-white font-medium">1</button>
                  <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">2</button>
                  <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">3</button>
                  <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">4</button>
                  <span className="px-2">...</span>
                  <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">&gt;</button>
                </div>
              </div>

              {/* Chart Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">Page Inside</h2>
                <div className="flex gap-2 mb-6 overflow-x-auto">
                  <button className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium whitespace-nowrap">Day</button>
                  <button className="px-6 py-2 hover:bg-gray-100 rounded-lg whitespace-nowrap">Week</button>
                  <button className="px-6 py-2 hover:bg-gray-100 rounded-lg whitespace-nowrap">Month</button>
                  <button className="px-6 py-2 hover:bg-gray-100 rounded-lg whitespace-nowrap">Year</button>
                </div>
                <div className="h-64 flex items-end justify-between gap-1">
                  {[40, 45, 90, 85, 120, 130, 140, 145, 155, 145, 150, 140].map((height, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all hover:from-blue-600 hover:to-blue-400" 
                      style={{ height: `${height}px` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-3">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Messages & Reviews */}
            <div className="space-y-6">
              {/* Messages */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Messages</h2>
                <div className="space-y-2">
                  {messages.map((message) => (
                    <MessageItem key={message.id} message={message} />
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200 mt-8">
          Copyright © 2025 Roomie. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLandlord;