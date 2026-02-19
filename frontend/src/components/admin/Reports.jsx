import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiDownload } from 'react-icons/fi';

const Reports = () => {
  const [occupancyReport, setOccupancyReport] = useState([]);
  const [complaintStats, setComplaintStats] = useState(null);
  const [customerReport, setCustomerReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [occupancyRes, complaintRes, customerRes] = await Promise.all([
        api.get('/admin/reports/occupancy'),
        api.get('/admin/reports/complaints'),
        api.get('/admin/reports/customers')
      ]);
      setOccupancyReport(occupancyRes.data);
      setComplaintStats(complaintRes.data);
      setCustomerReport(customerRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header] || '').join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>

      {/* Complaint Statistics */}
      {complaintStats && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Complaint Statistics</h2>
            <button
              onClick={() => {
                const data = [
                  { Metric: 'Total Complaints', Value: complaintStats.total },
                  { Metric: 'Resolved', Value: complaintStats.resolved },
                  { Metric: 'Resolution Rate', Value: `${complaintStats.resolutionRate}%` }
                ];
                exportToCSV(data, 'complaint-stats.csv');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <FiDownload />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Complaints</p>
              <p className="text-2xl font-bold">{complaintStats.total}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold">{complaintStats.resolved}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold">{complaintStats.resolutionRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">By Status</h3>
              <div className="space-y-2">
                {complaintStats.byStatus?.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span className="capitalize">{item._id}:</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">By Category</h3>
              <div className="space-y-2">
                {complaintStats.byCategory?.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span className="capitalize">{item._id}:</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">By Priority</h3>
              <div className="space-y-2">
                {complaintStats.byPriority?.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span className="capitalize">{item._id}:</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Report */}
      {customerReport && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Customer Report</h2>
            <button
              onClick={() => {
                const data = [{ Metric: 'Total Customers', Value: customerReport.totalCustomers }];
                exportToCSV(data, 'customer-report.csv');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <FiDownload />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold">{customerReport.totalCustomers}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Most Frequently Visited Customers</h3>
            {customerReport.frequentCustomers?.length ? (
              <div className="space-y-3">
                {customerReport.frequentCustomers.map((customer, idx) => {
                  const maxVisits = customerReport.frequentCustomers[0]?.totalVisits || 1;
                  const width = Math.max(12, Math.round((customer.totalVisits / maxVisits) * 100));
                  return (
                    <div key={`${customer.userId}-${idx}`} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span className="font-semibold text-gray-900">{customer.name}</span>
                        <span>{customer.totalVisits} visits</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-teal-600"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{customer.email}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600">No frequent customer data available.</p>
            )}
          </div>
        </div>
      )}

      {/* Occupancy Report */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Occupancy Report</h2>
          <button
            onClick={() => exportToCSV(occupancyReport, 'occupancy-report.csv')}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
        </div>

        {occupancyReport.length === 0 ? (
          <p className="text-gray-600">No data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Room Number</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Floor</th>
                  <th className="text-left py-3 px-4">Capacity</th>
                  <th className="text-left py-3 px-4">Occupancy</th>
                  <th className="text-left py-3 px-4">Occupancy Rate</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {occupancyReport.map((room, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 px-4">{room.roomNumber}</td>
                    <td className="py-3 px-4 capitalize">{room.roomType}</td>
                    <td className="py-3 px-4">{room.floor}</td>
                    <td className="py-3 px-4">{room.capacity}</td>
                    <td className="py-3 px-4">{room.currentOccupancy}</td>
                    <td className="py-3 px-4">{room.occupancyRate}%</td>
                    <td className="py-3 px-4 capitalize">{room.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
