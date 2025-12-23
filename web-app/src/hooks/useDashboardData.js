// src/pages/User/Dashboard/hooks/useDashboardData.jsx
import { useState, useEffect, useCallback } from "react";
import { getPropertiesByOwner } from "../services/property.service";
import { getMyBookings, getOwnerBookings } from "../services/booking.service";
import { getMyContracts } from "../services/contract.service";
import { getMyTenantBills, getMyLandlordBills } from "../services/billing.service";

const useDashboardData = (activeRole) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    properties: [],
    bookings: [],
    contracts: { asLandlord: [], asTenant: [] },
    bills: [],
  });

  const [stats, setStats] = useState({
    // Landlord stats
    totalProperties: 0,
    pendingProperties: 0,
    rentedProperties: 0,
    availableProperties: 0,
    monthlyIncome: 0,
    
    // Tenant stats
    activeBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    
    // Contract stats
    totalContracts: 0,
    activeContracts: 0,
    pendingContracts: 0,
    expiredContracts: 0,
    
    // Bill stats
    unpaidBills: 0,
    paidBills: 0,
    totalBillAmount: 0,
  });

  // Fetch all data based on role
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (activeRole === "landlord") {
        await fetchLandlordData();
      } else {
        await fetchTenantData();
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [activeRole]);

  // Fetch landlord data
  const fetchLandlordData = async () => {
    try {
      // Properties
      const propertiesRes = await getPropertiesByOwner();
      const properties = extractData(propertiesRes);
      
      // Bookings (as landlord)
      const bookingsRes = await getOwnerBookings();
      const bookings = extractData(bookingsRes);
      
      // Contracts
      const contractsRes = await getMyContracts();
      const contracts = contractsRes?.result || contractsRes?.data?.result || { asLandlord: [], asTenant: [] };
      
      // Bills (as landlord)
      const billsRes = await getMyLandlordBills();
      const bills = extractData(billsRes);
      
      setData({ properties, bookings, contracts, bills });
      calculateLandlordStats(properties, bookings, contracts.asLandlord, bills);
    } catch (error) {
      console.error("Error fetching landlord data:", error);
    }
  };

  // Fetch tenant data
  const fetchTenantData = async () => {
    try {
      // Bookings (as tenant)
      const bookingsRes = await getMyBookings();
      const bookings = extractData(bookingsRes);
      
      // Contracts
      const contractsRes = await getMyContracts();
      const contracts = contractsRes?.result || contractsRes?.data?.result || { asLandlord: [], asTenant: [] };
      
      // Bills (as tenant)
      const billsRes = await getMyTenantBills();
      const bills = extractData(billsRes);
      
      setData({ properties: [], bookings, contracts, bills });
      calculateTenantStats(bookings, contracts.asTenant, bills);
    } catch (error) {
      console.error("Error fetching tenant data:", error);
    }
  };

  // Extract data from API response
  const extractData = (response) => {
    if (!response) return [];
    if (response.success && response.result) return response.result;
    if (response.data?.result) return response.data.result;
    if (response.data?.content) return response.data.content;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  // Calculate landlord stats
  const calculateLandlordStats = (properties, bookings, contracts, bills) => {
    const totalProperties = properties.length;
    const pendingProperties = properties.filter(p => 
      ["DRAFT", "PENDING"].includes((p.status || p.propertyStatus || "").toUpperCase())
    ).length;
    const rentedProperties = properties.filter(p =>
      ["RENTED", "SOLD"].includes((p.status || p.propertyStatus || "").toUpperCase())
    ).length;
    const availableProperties = properties.filter(p =>
      ["AVAILABLE", "APPROVED", "ACTIVE"].includes((p.status || p.propertyStatus || "").toUpperCase())
    ).length;
    
    const monthlyIncome = properties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
    
    const activeContracts = contracts.filter(c => c.status === "ACTIVE").length;
    const pendingContracts = contracts.filter(c => c.status === "PENDING").length;
    const expiredContracts = contracts.filter(c => c.status === "EXPIRED" || c.status === "TERMINATED").length;
    
    const unpaidBills = bills.filter(b => b.status === "UNPAID").length;
    const paidBills = bills.filter(b => b.status === "PAID").length;
    const totalBillAmount = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    setStats({
      totalProperties,
      pendingProperties,
      rentedProperties,
      availableProperties,
      monthlyIncome,
      totalContracts: contracts.length,
      activeContracts,
      pendingContracts,
      expiredContracts,
      unpaidBills,
      paidBills,
      totalBillAmount,
    });
  };

  // Calculate tenant stats
  const calculateTenantStats = (bookings, contracts, bills) => {
    const activeBookings = bookings.filter(b => b.status === "CONFIRMED").length;
    const pendingBookings = bookings.filter(b => b.status === "PENDING").length;
    const completedBookings = bookings.filter(b => b.status === "COMPLETED").length;
    
    const activeContracts = contracts.filter(c => c.status === "ACTIVE").length;
    const pendingContracts = contracts.filter(c => c.status === "PENDING").length;
    const expiredContracts = contracts.filter(c => c.status === "EXPIRED" || c.status === "TERMINATED").length;
    
    const unpaidBills = bills.filter(b => b.status === "UNPAID").length;
    const paidBills = bills.filter(b => b.status === "PAID").length;
    const totalBillAmount = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    setStats({
      totalProperties: 0,
      pendingProperties: 0,
      rentedProperties: 0,
      availableProperties: 0,
      monthlyIncome: 0,
      activeBookings,
      pendingBookings,
      completedBookings,
      totalContracts: contracts.length,
      activeContracts,
      pendingContracts,
      expiredContracts,
      unpaidBills,
      paidBills,
      totalBillAmount,
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    data,
    stats,
    refetch: fetchData,
  };
};

export default useDashboardData;