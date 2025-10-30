'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import LimitChart from '@/components/LimitCharts';
import TrendChart from '@/components/TrendChart';
import AIWidget from '@/components/AIWidget';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function CardDetailsPage() {
  const params = useParams();
  const cardId = params.cardId;
  const router = useRouter();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [billDate, setBillDate] = useState('');
  const [billedAmount, setBilledAmount] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [category, setCategory] = useState('');

  const fetchCardDetails = useCallback(async () => {
    if (!cardId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/cards/${cardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCard(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        setError('Failed to fetch card details.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [cardId, router]);

  useEffect(() => {
    fetchCardDetails();
  }, [fetchCardDetails]);

  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Category data:', response.data[0]);
      setCategory(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        console.error('Failed to fetch card category.', err);
      }
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleAddBill = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/bills', 
        {
          cardId: cardId,
          billDate: billDate,
          billedAmount: billedAmount,
          minPaymentDue: minPayment,
          categoryId: selectedCategory
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Bill added successfully!');
      setBillDate('');
      setBilledAmount('');
      setMinPayment('');
      setSelectedCategory('');
      fetchCardDetails();
    } catch (err) {
      alert('Failed to add bill.');
      console.error(err);
    }
  };

  const handleMakePayment = async (billId) => {
    const amountStr = prompt('Enter payment amount:');
    if (!amountStr) return;

    const paymentAmount = parseFloat(amountStr);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        alert('Please enter a valid, positive number for the payment.');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3000/api/bills/${billId}`,
            { paymentAmount },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        alert('Payment successful!');
        fetchCardDetails();
    } catch (err) {
        alert('Payment failed.');
        console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/login');
  };

  if (loading) return <div>Loading card details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!card) return <div>Card not found.</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Card Details: **** **** **** {card.cardNumber}</h1>
        <Button variant="outline" onClick={handleLogout} className="text-black">Logout</Button>
      </header>
      <div className="grid grid-cols-12 gap-6">
        {/* Top Row */}
        <div className="col-span-8 bg-gray-900 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">AI Financial Review</h2>
          <div className="bg-gray-800 p-4 rounded-lg shadow-inner">
            <AIWidget cardId={cardId} />
          </div>
        </div>
        <div className="col-span-4 bg-gray-900 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Spending Distribution</h2>
          <LimitChart card={card} />
        </div>

        {/* Middle Row */}
        <div className="col-span-12 bg-gray-900 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Spending Trend</h2>
          <TrendChart cardId={cardId} />
        </div>

        {/* Bottom Row */}
        <div className="col-span-12 bg-gray-900 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Monthly Bills</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-500npm run d text-white hover:bg-blue-600 transition-colors">
                  + Add Bill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Monthly Bill</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddBill} className="space-y-4">
                  <input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>Select Category</option>
                    {category && category.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Billed Amount"
                    value={billedAmount}
                    onChange={(e) => setBilledAmount(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Minimum Payment Due"
                    value={minPayment}
                    onChange={(e) => setMinPayment(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <DialogFooter>
                    <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                      Add Bill
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {card.bills.length === 0 ? (
            <p className="text-gray-400">No bills have been recorded for this card yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-4 py-2 border-b border-gray-700">Bill Date</th>
                    <th className="px-4 py-2 border-b border-gray-700">Billed Amount</th>
                    <th className="px-4 py-2 border-b border-gray-700">Category</th>
                    <th className="px-4 py-2 border-b border-gray-700">Minimum Due</th>
                    <th className="px-4 py-2 border-b border-gray-700">Amount Cleared</th>
                    <th className="px-4 py-2 border-b border-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {card.bills.slice(0, 10).map(bill => {
                    const categoryName = Array.isArray(category) ? category.find(cat => cat.id === bill.category_id)?.name || 'Unknown' : 'Unknown';
                    return (
                      <tr key={bill.id} className="hover:bg-gray-800">
                        <td className="px-4 py-2 border-b border-gray-700">{new Date(bill.bill_date).toLocaleDateString()}</td>
                        <td className="px-4 py-2 border-b border-gray-700">₹{parseFloat(bill.billed_amount).toFixed(2)}</td>
                        <td className='px-4 py-2 border-b border-gray-700'>{categoryName}</td>
                        <td className="px-4 py-2 border-b border-gray-700">₹{parseFloat(bill.minimum_payment_due).toFixed(2)}</td>
                        <td className="px-4 py-2 border-b border-gray-700">₹{parseFloat(bill.monthly_cleared_amount).toFixed(2)}</td>
                        <td className="px-4 py-2 border-b border-gray-700">
                          <Button variant="outline" className="text-black" onClick={() => handleMakePayment(bill.id)}>
                            Make Payment
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}