import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '../../services/departmentService';
import { issueCategoryService } from '../../services/issueCategoryService';
import { ticketService } from '../../services/ticketService';
import { assetService } from '../../services/assetService';
import { attachmentService } from '../../services/attachmentService';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Monitor, 
  Wrench, 
  ShieldCheck, 
  Wifi, 
  Laptop, 
  Code, 
  Tv, 
  Tag, 
  Clock, 
  AlertCircle, 
  Zap, 
  Flame, 
  Camera, 
  Upload, 
  Check, 
  Paperclip,
  Info
} from 'lucide-react';

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useAuth();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [issueCategoryId, setIssueCategoryId] = useState<string>('');
  const [assetId, setAssetId] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [singleCategoryPopup, setSingleCategoryPopup] = useState<string | null>(null);

  // Fetch departments
  const { data: deptRes } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll(),
    retry: false,
  });

  // Fetch categories
  const { data: catRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => issueCategoryService.getAll(),
    retry: false,
  });

  // Fetch assets
  const { data: assetsRes } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetService.getAllAssets(),
    retry: false,
  });

  const departments = deptRes?.data || [];
  const allCategories = catRes?.data || [];
  const assets = assetsRes?.data || [];

  // Define department-specific fallback issue categories to guarantee exact department matching
  const departmentCategoryMap: Record<string, Array<{ id: number; name: string; description: string }>> = {
    it: [
      { id: 1, name: 'Network & Wifi Issues', description: 'Internet connectivity, router problems, WiFi authentication errors' },
      { id: 2, name: 'Hardware Repair', description: 'Physical damage, ports replacement, diagnostics for devices' },
      { id: 3, name: 'Software Installation', description: 'OS configuration, lab software packages, license renewals' },
      { id: 4, name: 'Smart Classroom / AV', description: 'Projector malfunctions, classroom audio setup, lecture capture' },
    ],
    facilities: [
      { id: 5, name: 'Facilities Maintenance', description: 'Electrical repairs, plumbing issues, temperature control' },
      { id: 101, name: 'Electrical & Power Supply', description: 'Wiring, power sockets, light fixtures, AC failures' },
      { id: 102, name: 'Plumbing & Water Leakage', description: 'Restroom plumbing, pipe leaks, water dispenser repairs' },
      { id: 103, name: 'Furniture & Civil Maintenance', description: 'Broken desks, door locks, whiteboard replacement' },
    ],
    operations: [
      { id: 201, name: 'Housekeeping & Sanitation', description: 'Classroom cleaning, waste management, sanitation' },
      { id: 202, name: 'Security & Access Control', description: 'ID card access, key issuance, gate pass queries' },
      { id: 203, name: 'Event & Hall Setup', description: 'Auditorium arrangements, seating, public address systems' },
    ],
  };

  // Get department-specific categories
  const getDepartmentCategories = () => {
    if (!departmentId) return [];
    const selectedDeptObj = departments.find((d) => d.id.toString() === departmentId);
    const deptName = (selectedDeptObj?.name || '').toLowerCase();
    const dId = Number(departmentId);

    // 1. IT Support
    if (dId === 1 || (deptName.includes('it') && !deptName.includes('facilit')) || (deptName.includes('support') && !deptName.includes('facilit'))) {
      const matches = allCategories.filter((c) => {
        const cn = c.name.toLowerCase();
        return cn.includes('wifi') || cn.includes('network') || cn.includes('hardware') || cn.includes('software') || cn.includes('smart') || cn.includes('av');
      });
      return matches.length > 0 ? matches : departmentCategoryMap.it;
    }

    // 2. Facilities Management
    if (dId === 2 || deptName.includes('facilit') || deptName.includes('estate') || deptName.includes('building')) {
      const matches = allCategories.filter((c) => {
        const cn = c.name.toLowerCase();
        return cn.includes('facilit') || cn.includes('electric') || cn.includes('plumb') || cn.includes('furniture') || cn.includes('civil') || cn.includes('water') || cn.includes('power');
      });
      return matches.length > 0 ? matches : departmentCategoryMap.facilities;
    }

    // 3. Campus Operations
    if (dId === 3 || deptName.includes('operat') || deptName.includes('campus') || deptName.includes('logistics')) {
      const matches = allCategories.filter((c) => {
        const cn = c.name.toLowerCase();
        return cn.includes('housekeep') || cn.includes('securit') || cn.includes('event') || cn.includes('hall') || cn.includes('sanitat') || cn.includes('access');
      });
      return matches.length > 0 ? matches : departmentCategoryMap.operations;
    }

    return allCategories;
  };

  // Icon mapping for 3 primary departments
  const getDepartmentIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('it') || (n.includes('support') && !n.includes('facilit'))) {
      return <Monitor className="w-6 h-6 text-indigo-600" />;
    }
    if (n.includes('facility') || n.includes('repair') || n.includes('building') || n.includes('estate')) {
      return <Wrench className="w-6 h-6 text-amber-600" />;
    }
    return <ShieldCheck className="w-6 h-6 text-emerald-600" />;
  };

  // Icon mapping for Issue Categories
  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('wifi') || n.includes('network') || n.includes('internet')) {
      return <Wifi className="w-5 h-5 text-blue-500" />;
    }
    if (n.includes('hardware') || n.includes('laptop') || n.includes('pc')) {
      return <Laptop className="w-5 h-5 text-purple-500" />;
    }
    if (n.includes('software') || n.includes('app') || n.includes('install')) {
      return <Code className="w-5 h-5 text-indigo-500" />;
    }
    if (n.includes('smart') || n.includes('av') || n.includes('projector') || n.includes('classroom')) {
      return <Tv className="w-5 h-5 text-pink-500" />;
    }
    if (n.includes('facilit') || n.includes('electric') || n.includes('power') || n.includes('plumb') || n.includes('furniture')) {
      return <Wrench className="w-5 h-5 text-amber-500" />;
    }
    if (n.includes('housekeep') || n.includes('sanitat') || n.includes('securit') || n.includes('event')) {
      return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
    }
    return <Tag className="w-5 h-5 text-slate-500" />;
  };

  const priorityOptions = [
    {
      id: 'LOW',
      label: 'LOW',
      desc: 'Minor issue / non-urgent',
      icon: <Clock className="w-5 h-5 text-green-600" />,
      colorClass: 'border-green-200 bg-green-50 text-green-900',
      activeClass: 'ring-2 ring-green-600 bg-green-100 border-green-500',
    },
    {
      id: 'MEDIUM',
      label: 'MEDIUM',
      desc: 'Standard support task',
      icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
      colorClass: 'border-amber-200 bg-amber-50 text-amber-900',
      activeClass: 'ring-2 ring-amber-600 bg-amber-100 border-amber-500',
    },
    {
      id: 'HIGH',
      label: 'HIGH',
      desc: 'Disruptive issue',
      icon: <Zap className="w-5 h-5 text-orange-600" />,
      colorClass: 'border-orange-200 bg-orange-50 text-orange-900',
      activeClass: 'ring-2 ring-orange-600 bg-orange-100 border-orange-500',
    },
    {
      id: 'CRITICAL',
      label: 'CRITICAL',
      desc: 'Immediate campus impact',
      icon: <Flame className="w-5 h-5 text-red-600" />,
      colorClass: 'border-red-200 bg-red-50 text-red-900',
      activeClass: 'ring-2 ring-red-600 bg-red-100 border-red-500',
    },
  ];

  const handleCategoryClick = (catId: string, catName: string) => {
    if (issueCategoryId && issueCategoryId !== catId) {
      setSingleCategoryPopup(`Note: Only 1 issue category can be selected per support ticket. Selected category updated to "${catName}".`);
      setTimeout(() => setSingleCategoryPopup(null), 4000);
    }
    setIssueCategoryId(catId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !departmentId || !issueCategoryId) {
      setErrorMsg('Please fill in all required fields (Department, Category, Title & Description).');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const payload = {
        title,
        description,
        priority,
        userId: 1, // Fallback; backend automatically binds to logged in user session
        departmentId: Number(departmentId),
        subDepartmentId: null, // Sub-department removed per requirement
        issueCategoryId: Number(issueCategoryId),
        assetId: assetId ? Number(assetId) : null,
      };

      const res = await ticketService.create(payload);

      // Upload optional photo attachment if provided
      if (photoFile && res.data?.id) {
        try {
          await attachmentService.uploadFile(res.data.id, photoFile);
        } catch (uploadErr) {
          console.error('Failed to attach photo:', uploadErr);
        }
      }

      setSuccessMsg('Support ticket submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setTimeout(() => {
        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
          navigate('/admin/tickets');
        } else {
          navigate('/user/dashboard');
        }
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to create ticket. Please verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCategories = getDepartmentCategories();

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link 
          to={role === 'ADMIN' || role === 'SUPER_ADMIN' ? '/admin/tickets' : '/user/dashboard'} 
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Raise Campus Support Ticket</h1>
          <p className="text-xs text-slate-500 mt-0.5">Select a department and issue category to quickly submit a service request.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        {successMsg && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl font-medium flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* 1. Ticket Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Ticket Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="e.g. WiFi authentication failure in Computer Lab #3"
          />
        </div>

        {/* 2. Select Department (3 Main Cards) */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            1. Select Service Department *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {departments.map((d) => {
              const isSelected = departmentId === d.id.toString();
              return (
                <div
                  key={d.id}
                  onClick={() => {
                    setDepartmentId(d.id.toString());
                    setIssueCategoryId('');  // reset category when department changes
                    setSingleCategoryPopup(null);
                  }}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-start space-y-2 relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500 shadow-sm'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2.5 bg-white rounded-lg border border-slate-100 shadow-xs">
                    {getDepartmentIcon(d.name)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{d.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{d.description || 'Campus department support'}</p>
                  </div>
                  {isSelected && (
                    <span className="absolute top-3 right-3 bg-indigo-600 text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Popup / Notice for Single Issue Category Enforcement */}
        {singleCategoryPopup && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs rounded-xl font-medium flex items-center space-x-2 animate-fade-in">
            <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>{singleCategoryPopup}</span>
          </div>
        )}

        {/* 3. Issue Category Cards (Strictly Filtered by Selected Department) */}
        {departmentId && (
          <div className="space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Select Related Issue (Only 1 issue per ticket) *
              </label>
              <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Showing categories for {departments.find(d => d.id.toString() === departmentId)?.name}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeCategories.map((c) => {
                const isSelected = issueCategoryId === c.id.toString();
                return (
                  <div
                    key={c.id}
                    onClick={() => handleCategoryClick(c.id.toString(), c.name)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center space-x-3 relative ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500 shadow-sm'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-xs flex-shrink-0">
                      {getCategoryIcon(c.name)}
                    </div>
                    <div className="min-w-0 pr-6">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{c.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{c.description || 'Issue category details'}</p>
                    </div>
                    {isSelected && (
                      <span className="absolute right-3 bg-indigo-600 text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Visual Priority Cards */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            3. Select Urgency / Priority *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {priorityOptions.map((opt) => {
              const isSelected = priority === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setPriority(opt.id)}
                  className={`cursor-pointer p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 relative ${
                    isSelected ? opt.activeClass : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="mb-0.5">{opt.icon}</div>
                  <h4 className="text-xs font-bold tracking-wider">{opt.label}</h4>
                  <p className="text-[9px] opacity-75">{opt.desc}</p>
                  {isSelected && (
                    <span className="absolute top-2 right-2 bg-slate-800 text-white rounded-full p-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Detailed Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            4. Detailed Problem Description *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="Describe the issue in detail, exact building/room location, error codes..."
          />
        </div>

        {/* 6. Upload Photo of Problem (Optional) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <Camera className="w-4 h-4 text-indigo-600" />
            <span>Upload Photo of Issue (Optional)</span>
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative cursor-pointer flex flex-col items-center justify-center">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setPhotoFile(e.target.files[0]);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {photoFile ? (
              <div className="flex items-center space-x-2 text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 text-xs font-semibold">
                <Paperclip className="w-4 h-4" />
                <span>Selected: {photoFile.name}</span>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <p className="text-xs font-semibold text-slate-700">Click or Drag Photo to Attach</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Attach a photo of the damaged equipment, room, or error screen</p>
              </>
            )}
          </div>
        </div>

        {/* 7. Link Asset (Optional) */}
        {assets.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Link Campus Asset (Optional)
            </label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a Campus Asset...</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.assetTag})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-6 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <span>Submitting Ticket...</span>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>Submit Support Request</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateTicket;
