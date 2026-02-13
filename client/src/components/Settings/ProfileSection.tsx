import React from 'react';
import { User, Mail, Shield, Camera } from 'lucide-react';

export const ProfileSection: React.FC = () => {
    return (
        <div className="card p-6 mb-6">
            <h3 className="text-lg font-medium text-white mb-4 border-b border-industrial-800 pb-2">User Profile</h3>
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-industrial-800 flex items-center justify-center text-4xl font-bold text-industrial-500 border-2 border-industrial-700 overflow-hidden">
                        {/* Placeholder for avatar image */}
                         <span>OP</span>
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera className="text-white" size={24} />
                    </div>
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-industrial-400 mb-1">Full Name</label>
                            <div className="flex items-center bg-industrial-900 border border-industrial-800 rounded px-3 py-2 text-white">
                                <User size={16} className="mr-2 text-industrial-500" />
                                <span>Operator 01</span>
                            </div>
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-industrial-400 mb-1">Email Address</label>
                            <div className="flex items-center bg-industrial-900 border border-industrial-800 rounded px-3 py-2 text-white">
                                <Mail size={16} className="mr-2 text-industrial-500" />
                                <span>operator01@industry.local</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-industrial-400 mb-1">Role</label>
                            <div className="flex items-center bg-industrial-900 border border-industrial-800 rounded px-3 py-2 text-white">
                                <Shield size={16} className="mr-2 text-industrial-500" />
                                <span>Senior Operator</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-industrial-400 mb-1">Department</label>
                            <div className="bg-industrial-900 border border-industrial-800 rounded px-3 py-2 text-white">
                                <span>Control Room A</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
