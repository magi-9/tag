import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../../utils/api';
import { Check, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const queryClient = useQueryClient();

  const { data: pendingUsers } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async () => {
      const response = await userAPI.getPendingApprovals();
      return response.data;
    }
  });

  const { data: allUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const response = await userAPI.getUsers();
      return response.data.results || response.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: (userId) => userAPI.approveUser(userId),
    onSuccess: () => {
      toast.success('Používateľ schválený!');
      queryClient.invalidateQueries(['pending-users']);
      queryClient.invalidateQueries(['all-users']);
    }
  });

  const revokeMutation = useMutation({
    mutationFn: (userId) => userAPI.revokeApproval(userId),
    onSuccess: () => {
      toast.success('Schválenie zrušené');
      queryClient.invalidateQueries(['pending-users']);
      queryClient.invalidateQueries(['all-users']);
    }
  });

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pendingUsers && pendingUsers.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users size={24} className="text-accent" />
            Čakajú na schválenie ({pendingUsers.length})
          </h2>
          <div className="space-y-3">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-warning/10 rounded-lg"
              >
                <div>
                  <p className="font-bold">{user.full_name || user.username}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.phone && (
                    <p className="text-sm text-gray-600">{user.phone}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveMutation.mutate(user.id)}
                    disabled={approveMutation.isLoading}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Check size={18} />
                    Schváliť
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Všetci používatelia</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Meno</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-center">Body</th>
                <th className="px-4 py-2 text-center">Stav</th>
                <th className="px-4 py-2 text-center">Akcie</th>
              </tr>
            </thead>
            <tbody>
              {allUsers?.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{user.full_name || user.username}</p>
                      {user.is_staff && (
                        <span className="badge badge-success text-xs">Admin</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-accent">
                    {user.total_points}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.is_approved ? (
                      <span className="badge badge-success">Schválený</span>
                    ) : (
                      <span className="badge badge-warning">Čaká</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!user.is_staff && user.is_approved && (
                      <button
                        onClick={() => revokeMutation.mutate(user.id)}
                        disabled={revokeMutation.isLoading}
                        className="btn btn-outline text-sm"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
