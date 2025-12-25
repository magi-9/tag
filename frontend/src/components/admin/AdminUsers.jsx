import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../../utils/api';
import { Check, X, Users, Gamepad2, Shield, Trash2, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useAuthStore } from '../../stores/authStore';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

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
      queryClient.invalidateQueries(['all-users']);
    }
  });

  const toggleParticipationMutation = useMutation({
    mutationFn: ({ userId, isParticipating }) =>
      userAPI.updateUser(userId, { is_participating: isParticipating }),
    onSuccess: () => {
      toast.success('Stav účasti zmenený');
      queryClient.invalidateQueries(['all-users']);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => userAPI.deleteUser(userId),
    onSuccess: () => {
      toast.success('Používateľ bol natrvalo vymazaný');
      queryClient.invalidateQueries(['all-users']);
      queryClient.invalidateQueries(['pending-users']);
    }
  });

  const handleDeleteUser = (user) => {
    if (user.id === currentUser.id) {
      toast.error('Nemôžete vymazať samého seba!');
      return;
    }

    if (window.confirm(`Naozaj chcete natrvalo vymazať používateľa ${user.full_name || user.username}? Táto akcia je nevratná!`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pendingUsers && pendingUsers.length > 0 && (
        <div className="bg-orange-50/50 border border-orange-100 rounded-[2rem] p-6">
          <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-orange-700">
            <Users size={20} />
            Čakajú na schválenie ({pendingUsers.length})
          </h2>
          <div className="space-y-3">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-white border border-orange-100 rounded-2xl shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-bold truncate">{user.full_name || user.username}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => approveMutation.mutate(user.id)}
                    className="p-2.5 bg-success text-white rounded-xl hover:scale-105 transition-transform"
                    title="Schváliť"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="p-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title="Vymazať registráciu"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users List */}
      <div className="space-y-4">
        <h2 className="text-xl font-black px-1 flex items-center gap-2">
          <Users size={20} className="text-accent" />
          Všetci používatelia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allUsers?.map((user) => (
            <div key={user.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              {user.is_staff && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-bl-2xl uppercase tracking-widest flex items-center gap-1">
                    <Shield size={10} />
                    Admin
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent text-xl font-black shrink-0 border border-accent/5">
                  {user.full_name?.charAt(0) || user.username.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-900 truncate leading-tight mt-1">{user.full_name || user.username}</h3>
                  <p className="text-xs text-gray-400 font-medium truncate mb-2">{user.email}</p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleParticipationMutation.mutate({
                        userId: user.id,
                        isParticipating: !user.is_participating
                      })}
                      className={clsx(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 border shadow-sm",
                        user.is_participating
                          ? "bg-green-50 border-green-100 text-green-600"
                          : "bg-gray-50 border-gray-100 text-gray-400"
                      )}
                    >
                      <Gamepad2 size={12} />
                      {user.is_participating ? 'ZAPOJENÝ' : 'MIMO HRY'}
                    </button>

                    <div className="px-3 py-1.5 bg-accent/5 border border-accent/10 rounded-xl text-[10px] font-black text-accent flex items-center gap-2 shadow-sm">
                      <span>{user.total_points} BODOV</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Actions */}
              <div className="mt-6 pt-4 border-t border-gray-50 flex gap-2">
                {!user.is_staff && user.is_approved && (
                  <button
                    onClick={() => revokeMutation.mutate(user.id)}
                    className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-2xl text-[10px] font-black hover:bg-orange-50 hover:text-orange-600 border border-transparent hover:border-orange-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <UserX size={14} />
                    Zrušiť schválenie
                  </button>
                )}

                {(!user.is_staff || user.id !== currentUser.id) && (
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="p-3 bg-red-50 text-red-500 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title="Vymazať účet"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                {user.is_staff && user.id === currentUser.id && (
                  <div className="flex-1 py-3 bg-accent/5 text-accent rounded-2xl text-[10px] font-black text-center uppercase tracking-widest border border-accent/10 italic">
                    Tento účet (TY)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
