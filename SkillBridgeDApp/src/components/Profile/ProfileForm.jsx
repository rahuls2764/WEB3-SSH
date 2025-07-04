import React, { useState } from 'react';
import { Edit3, Save, X, Wallet, Copy } from 'lucide-react';
import { useWeb3 } from '../../context/Web3Context';
import toast from 'react-hot-toast';

export default function ProfileForm({ profile, setProfile }) {
  const { updateUserProfile, account } = useWeb3();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(profile || {});
  const [userAvatar, setUserAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

  const copyWallet = () => {
    navigator.clipboard.writeText(account);
    toast.success("Wallet copied!");
  };

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setUserAvatar(file);
    } else {
      toast.error("Only PNG or JPEG images are allowed");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile({ ...form, userAvatar });
      setProfile({ ...form, avatarCid: form.avatarCid });
      toast.success("Profile updated!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          {form.avatarCid ? (
            <img
              src={`https://gateway.pinata.cloud/ipfs/${form.avatarCid}`}
              alt="Avatar"
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-lg text-gray-500">
              {form.userName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{form.userName || 'Your Name'}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Wallet size={16} />
              <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
              <button onClick={copyWallet}><Copy size={14} /></button>
            </div>
          </div>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="bg-cyan-600 px-4 py-2 rounded text-white hover:bg-cyan-700">
            <Edit3 size={16} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-400 px-4 py-2 rounded text-white hover:bg-gray-500">
              <X size={16} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['userName', 'email', 'skills', 'city', 'bio'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize text-gray-700">{field}</label>
            {isEditing ? (
              <input
                type="text"
                value={form[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg"
              />
            ) : (
              <p className="text-gray-600">{form[field] || 'Not set'}</p>
            )}
          </div>
        ))}
        {isEditing && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Profile Avatar</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleAvatarChange}
              className="w-full text-sm text-gray-600"
            />
          </div>
        )}
      </div>
    </div>
  );
}
