import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pill, 
  Plus, 
  Upload, 
  Download, 
  Clock, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  X,
  User,
  FileText,
  Edit3,
  Save,
  Trash2,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate: string;
  prescribingDoctor: string;
  status: 'active' | 'low-stock' | 'expired';
  notes?: string;
  sideEffects?: string;
  taken: { [key: string]: boolean }; // date -> taken status
}

interface MedicineSchedule {
  time: string;
  medicines: {
    id: string;
    name: string;
    dosage: string;
    taken: boolean;
  }[];
}

export const MyMedicinesPage: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'current' | 'schedule' | 'history'>('current');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      times: ['08:00'],
      startDate: '2025-01-01',
      endDate: '2025-03-01',
      prescribingDoctor: 'Dr. Sarah Johnson',
      status: 'active',
      notes: 'Take with food',
      sideEffects: 'Mild dizziness in first week',
      taken: { '2025-01-15': true, '2025-01-16': false }
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      times: ['08:00', '20:00'],
      startDate: '2024-12-15',
      endDate: '2025-01-20',
      prescribingDoctor: 'Dr. Michael Chen',
      status: 'low-stock',
      notes: 'Take with meals',
      sideEffects: 'Stomach upset initially',
      taken: { '2025-01-15': true, '2025-01-16': true }
    },
    {
      id: '3',
      name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'Once daily',
      times: ['09:00'],
      startDate: '2024-11-01',
      endDate: '2025-01-10',
      prescribingDoctor: 'Dr. Emily Rodriguez',
      status: 'expired',
      notes: 'Take with breakfast',
      taken: { '2025-01-15': false, '2025-01-16': false }
    }
  ]);

  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    times: [''],
    startDate: '',
    endDate: '',
    prescribingDoctor: '',
    notes: ''
  });

  const todaySchedule: MedicineSchedule[] = [
    {
      time: '08:00',
      medicines: [
        { id: '1', name: 'Lisinopril', dosage: '10mg', taken: true },
        { id: '2', name: 'Metformin', dosage: '500mg', taken: true }
      ]
    },
    {
      time: '09:00',
      medicines: [
        { id: '3', name: 'Vitamin D3', dosage: '1000 IU', taken: false }
      ]
    },
    {
      time: '20:00',
      medicines: [
        { id: '2', name: 'Metformin', dosage: '500mg', taken: false }
      ]
    }
  ];

  const getStatusColor = (status: Medicine['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'low-stock': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: Medicine['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'low-stock': return <AlertTriangle className="w-4 h-4" />;
      case 'expired': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getRefillAlerts = () => {
    const today = new Date();
    const fiveDaysFromNow = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
    
    return medicines.filter(medicine => {
      const endDate = new Date(medicine.endDate);
      return endDate <= fiveDaysFromNow && medicine.status === 'active';
    });
  };

  const handleAddMedicine = () => {
    const medicine: Medicine = {
      id: Date.now().toString(),
      ...newMedicine,
      status: 'active',
      taken: {}
    };
    
    setMedicines(prev => [...prev, medicine]);
    setNewMedicine({
      name: '',
      dosage: '',
      frequency: '',
      times: [''],
      startDate: '',
      endDate: '',
      prescribingDoctor: '',
      notes: ''
    });
    setShowAddModal(false);
  };

  const handleUpdateSideEffects = (medicineId: string, sideEffects: string) => {
    setMedicines(prev => prev.map(med => 
      med.id === medicineId ? { ...med, sideEffects } : med
    ));
  };

  const handleMarkAsTaken = (scheduleTime: string, medicineId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setMedicines(prev => prev.map(med => 
      med.id === medicineId 
        ? { ...med, taken: { ...med.taken, [today]: !med.taken[today] } }
        : med
    ));
  };

  const downloadMedicineList = () => {
    const content = medicines.map(med => 
      `Medicine: ${med.name}\nDosage: ${med.dosage}\nFrequency: ${med.frequency}\nDoctor: ${med.prescribingDoctor}\nStart: ${med.startDate}\nEnd: ${med.endDate}\nNotes: ${med.notes || 'None'}\n\n`
    ).join('');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-medicines.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const refillAlerts = getRefillAlerts();

  const tabs = [
    { id: 'current', label: 'Current Medicines', icon: Pill },
    { id: 'schedule', label: 'Today\'s Schedule', icon: Clock },
    { id: 'history', label: 'Medicine History', icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Medicines
          </h1>
          <p className="text-gray-600 text-lg">
            Track your medications and manage your prescription schedule
          </p>
        </motion.div>

        {/* Refill Alerts */}
        {refillAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white mb-8"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Refill Alert</h3>
                <p className="text-orange-100">
                  {refillAlerts.length} medicine(s) need refilling within 5 days
                </p>
                <div className="mt-2">
                  {refillAlerts.map(med => (
                    <span key={med.id} className="inline-block bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm mr-2 mb-1">
                      {med.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Medicine</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Prescription</span>
          </button>
          
          <button
            onClick={downloadMedicineList}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Download List</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                console.log('Prescription uploaded:', e.target.files[0].name);
              }
            }}
          />
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="flex space-x-1 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Current Medicines Tab */}
          {activeTab === 'current' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {medicines.map((medicine, index) => (
                <motion.div
                  key={medicine.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{medicine.name}</h3>
                      <p className="text-gray-600">{medicine.dosage} • {medicine.frequency}</p>
                    </div>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(medicine.status)}`}>
                      {getStatusIcon(medicine.status)}
                      <span className="capitalize">{medicine.status.replace('-', ' ')}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>Prescribed by {medicine.prescribingDoctor}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{medicine.startDate} to {medicine.endDate}</span>
                    </div>
                    {medicine.notes && (
                      <div className="flex items-start space-x-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4 mt-0.5" />
                        <span>{medicine.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Side Effects Notes
                    </label>
                    <textarea
                      value={medicine.sideEffects || ''}
                      onChange={(e) => handleUpdateSideEffects(medicine.id, e.target.value)}
                      placeholder="Log any side effects you experience..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      rows={2}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Today's Schedule Tab */}
          {activeTab === 'schedule' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Today's Medicine Schedule</h3>
              <div className="space-y-4">
                {todaySchedule.map((schedule, index) => (
                  <motion.div
                    key={schedule.time}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {schedule.time}
                    </div>
                    <div className="flex-1 space-y-2">
                      {schedule.medicines.map((medicine) => (
                        <div key={medicine.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div>
                            <h4 className="font-semibold text-gray-900">{medicine.name}</h4>
                            <p className="text-sm text-gray-600">{medicine.dosage}</p>
                          </div>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={medicine.taken}
                              onChange={() => handleMarkAsTaken(schedule.time, medicine.id)}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {medicine.taken ? 'Taken' : 'Mark as Taken'}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Medicine History Tab */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Medicine History</h3>
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Medicine history tracking would be implemented here</p>
                <p className="text-sm">Including past prescriptions and adherence reports</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Add Medicine Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Add New Medicine</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medicine Name *
                      </label>
                      <input
                        type="text"
                        value={newMedicine.name}
                        onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter medicine name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        value={newMedicine.dosage}
                        onChange={(e) => setNewMedicine(prev => ({ ...prev, dosage: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 10mg, 1 tablet"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequency *
                      </label>
                      <select
                        value={newMedicine.frequency}
                        onChange={(e) => setNewMedicine(prev => ({ ...prev, frequency: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select frequency</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="Four times daily">Four times daily</option>
                        <option value="As needed">As needed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prescribing Doctor *
                      </label>
                      <input
                        type="text"
                        value={newMedicine.prescribingDoctor}
                        onChange={(e) => setNewMedicine(prev => ({ ...prev, prescribingDoctor: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Doctor's name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={newMedicine.startDate}
                        onChange={(e) => setNewMedicine(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={newMedicine.endDate}
                        onChange={(e) => setNewMedicine(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={newMedicine.notes}
                      onChange={(e) => setNewMedicine(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Any special instructions or notes..."
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddMedicine}
                      disabled={!newMedicine.name || !newMedicine.dosage || !newMedicine.frequency}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Medicine
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};