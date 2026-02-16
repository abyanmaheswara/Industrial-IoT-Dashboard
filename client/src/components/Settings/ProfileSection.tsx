import React from 'react';
import { User, Mail, Shield, Camera, Trash2, Loader } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export const ProfileSection: React.FC = () => {
    const { user } = useAuth();
    const [avatar, setAvatar] = React.useState<string | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        // Load avatar from local storage based on username
        if (user?.username) {
            const savedAvatar = localStorage.getItem(`avatar_${user.username}`);
            if (savedAvatar) setAvatar(savedAvatar);
        }
    }, [user]);

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400;
                    const MAX_HEIGHT = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setIsUploading(true);
        try {
            const compressedImage = await compressImage(file);
            setAvatar(compressedImage);
            if (user?.username) {
                localStorage.setItem(`avatar_${user.username}`, compressedImage);
                // Dispatch event for Header to update
                window.dispatchEvent(new Event('avatarUpdate'));
            }
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Failed to process image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAvatar = () => {
        if (confirm('Are you sure you want to remove your profile photo?')) {
            setAvatar(null);
            if (user?.username) {
                localStorage.removeItem(`avatar_${user.username}`);
                window.dispatchEvent(new Event('avatarUpdate'));
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-industrial-800">
                <User className="text-brand-500" size={20} />
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">User Profile</h3>
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                        <div className="w-24 h-24 rounded-full bg-industrial-950 flex items-center justify-center text-4xl font-bold text-industrial-700 border-2 border-industrial-800 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] ring-2 ring-brand-500/10 group-hover:ring-brand-500/30 transition-all">
                            {isUploading ? (
                                <Loader className="animate-spin text-brand-500" size={32} />
                            ) : avatar ? (
                                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-brand-500/50">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                            )}
                        </div>
                        {!isUploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Camera className="text-white" size={24} />
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>
                    {avatar && !isUploading && (
                        <button
                            onClick={handleDeleteAvatar}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-red-500 hover:bg-red-950/20 rounded transition-colors font-bold uppercase tracking-widest"
                        >
                            <Trash2 size={14} />
                            Remove Photo
                        </button>
                    )}
                    <p className="text-xs text-industrial-500 dark:text-industrial-500 text-center">
                        Max 2MB • JPG, PNG
                    </p>
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-industrial-500 uppercase tracking-widest mb-1">Username</label>
                            <div className="flex items-center bg-industrial-950 border border-industrial-800 rounded px-3 py-2 text-white">
                                <User size={14} className="mr-2 text-brand-500" />
                                <span className="text-sm font-bold tracking-tight">{user?.username || 'Guest'}</span>
                            </div>
                        </div>
                         <div>
                            <label className="block text-[10px] font-black text-industrial-500 uppercase tracking-widest mb-1">User ID</label>
                            <div className="flex items-center bg-industrial-950 border border-industrial-800 rounded px-3 py-2 text-white">
                                <Mail size={14} className="mr-2 text-brand-500" />
                                <span className="text-sm font-mono">{user?.id ? `USER-${user.id}` : 'N/A'}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-industrial-500 uppercase tracking-widest mb-1">Role</label>
                            <div className="flex items-center bg-industrial-950 border border-industrial-800 rounded px-3 py-2 text-white">
                                <Shield size={14} className="mr-2 text-brand-500" />
                                <span className="text-sm font-bold uppercase tracking-tighter text-brand-500">{user?.role || 'Viewer'}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-industrial-500 uppercase tracking-widest mb-1">Department</label>
                            <div className="bg-industrial-950 border border-industrial-800 rounded px-3 py-2 text-white">
                                <span className="text-sm">General Operations</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                        <button className="px-6 py-2 bg-gradient-to-r from-brand-700 to-brand-500 hover:from-brand-600 hover:to-brand-400 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(168,121,50,0.2)]" onClick={() => alert("Profile updated!")}>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
