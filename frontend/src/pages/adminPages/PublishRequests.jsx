import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

export default function PublishRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'published_jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching publish requests:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAction = async (id, status, email) => {
    try {
      setActionLoading(id);
      const docRef = doc(db, 'published_jobs', id);
      await updateDoc(docRef, { status });

      // TODO: Call backend endpoint or EmailJS to send email notification to `email`.
      console.log(`[Email Stub] Would send ${status} email to ${email}`);

    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FaSpinner className="animate-spin text-4xl text-teal-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Publish Requests</h1>
        <p className="text-gray-400 mt-2 text-sm font-medium">Manage and review job publish requests.</p>
      </div>

      <div className="bg-gray-900/50 rounded-2xl border border-white/10 p-6 overflow-hidden">
        {requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No publish requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                  <th className="p-4 font-semibold">Company / Publisher</th>
                  <th className="p-4 font-semibold">Job Title</th>
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{req.companyName}</div>
                      <div className="text-xs text-gray-400">{req.publisherName}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-teal-300">{req.jobTitle}</div>
                      <div className="text-xs text-gray-400">{req.address} • {req.numberOfPositions} pos.</div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">
                      <div>{req.email}</div>
                      <div className="text-xs text-gray-500">{req.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {req.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={actionLoading === req.id}
                            onClick={() => handleAction(req.id, 'approved', req.email)}
                            className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30"
                            title="Approve"
                          >
                            {actionLoading === req.id ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                          </button>
                          <button
                            disabled={actionLoading === req.id}
                            onClick={() => handleAction(req.id, 'rejected', req.email)}
                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/30"
                            title="Reject"
                          >
                            {actionLoading === req.id ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
