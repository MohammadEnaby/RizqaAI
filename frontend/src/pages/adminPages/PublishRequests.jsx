import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaTimes, FaEye } from 'react-icons/fa';

export default function PublishRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

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

  const handleAction = async (request, status) => {
    try {
      setActionLoading(request.id);
      
      if (status === 'approved') {
        // Add to jobs collection
        await addDoc(collection(db, 'jobs'), {
          title: request.jobTitle || '',
          location: request.address || '',
          numberOfPositions: request.numberOfPositions || '',
          requirements: request.requirements || '',
          advantages: request.advantages || '',
          companyName: request.companyName || '',
          publisherName: request.publisherName || '',
          email: request.email || '',
          phone: request.phone || '',
          source: 'User Submission',
          createdAt: new Date()
        });
      }

      // Remove from published_jobs collection
      const docRef = doc(db, 'published_jobs', request.id);
      await deleteDoc(docRef);

      // TODO: Call backend endpoint or EmailJS to send email notification to `email`.
      console.log(`[Email Stub] Would send ${status} email to ${request.email}`);

    } catch (error) {
      console.error("Error processing request:", error);
      alert("Failed to process request.");
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
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="p-2 bg-teal-500/10 text-teal-400 rounded-lg hover:bg-teal-500/20 transition-colors border border-teal-500/30"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {req.status === 'pending' && (
                          <>
                            <button
                              disabled={actionLoading === req.id}
                              onClick={() => handleAction(req, 'approved')}
                              className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30"
                              title="Approve"
                            >
                              {actionLoading === req.id ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                            </button>
                            <button
                              disabled={actionLoading === req.id}
                              onClick={() => handleAction(req, 'rejected')}
                              className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/30"
                              title="Reject"
                            >
                              {actionLoading === req.id ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border flex flex-col max-h-[90vh]" style={{ background: 'rgba(10,30,46,0.98)', borderColor: 'rgba(52,232,158,0.2)' }}>
            <div className="px-6 py-4 border-b flex justify-between items-center flex-shrink-0" style={{ borderColor: 'rgba(52,232,158,0.15)', background: 'rgba(7,24,37,0.5)' }}>
              <h3 className="text-lg font-bold" style={{ color: '#e2f8f0' }}>Job Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="transition-colors hover:text-white"
                style={{ color: 'rgba(226,248,240,0.5)' }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto text-sm text-gray-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-semibold">Job Title</span>
                  <span className="text-teal-300 font-bold text-base">{selectedRequest.jobTitle}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-semibold">Company</span>
                  <span className="text-white font-bold text-base">{selectedRequest.companyName}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-semibold">Publisher</span>
                  <span className="text-white">{selectedRequest.publisherName || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-semibold">Location / Address</span>
                  <span className="text-white">{selectedRequest.address || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-semibold">Number of Positions</span>
                  <span className="text-white">{selectedRequest.numberOfPositions || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-semibold">Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedRequest.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    selectedRequest.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-semibold">Contact Email</span>
                  <span className="text-white break-all">{selectedRequest.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-semibold">Contact Phone</span>
                  <span className="text-white">{selectedRequest.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <span className="block text-xs text-gray-500 uppercase font-semibold mb-2">Requirements</span>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5 whitespace-pre-wrap text-white">
                  {selectedRequest.requirements || 'No requirements specified.'}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <span className="block text-xs text-gray-500 uppercase font-semibold mb-2">Advantages</span>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5 whitespace-pre-wrap text-white">
                  {selectedRequest.advantages || 'No advantages specified.'}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3 flex-shrink-0" style={{ borderColor: 'rgba(52,232,158,0.15)', background: 'rgba(7,24,37,0.4)' }}>
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-sm font-semibold rounded-xl hover:bg-white/5 transition-colors"
                style={{ color: 'rgba(226,248,240,0.5)' }}
              >
                Close
              </button>
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    disabled={actionLoading === selectedRequest.id}
                    onClick={async () => {
                      const req = selectedRequest;
                      setSelectedRequest(null);
                      await handleAction(req, 'approved');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 rounded-xl text-sm font-semibold transition-colors"
                  >
                    {actionLoading === selectedRequest.id ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                    Approve
                  </button>
                  <button
                    disabled={actionLoading === selectedRequest.id}
                    onClick={async () => {
                      const req = selectedRequest;
                      setSelectedRequest(null);
                      await handleAction(req, 'rejected');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-sm font-semibold transition-colors"
                  >
                    {actionLoading === selectedRequest.id ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
