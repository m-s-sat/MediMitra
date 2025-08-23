  'use client'
  import React, { useState } from 'react';
  import { motion } from 'framer-motion';
  import { 
    Calendar, 
    Clock, 
    Video, 
    MapPin, 
    Search, 
    Filter,
    Star,
    Plus,
    CheckCircle,
    MessageSquare
  } from 'lucide-react';
  import { useLanguage } from '../context/LanguageContext';

  interface Doctor {
    id: string;
    name: string;
    department: string;
    specialization: string;
    rating: number;
    experience: number;
    consultationFee: number;
    image: string;
    availableSlots: string[];
  }

  export const AppointmentsPage: React.FC = () => {
    const { t } = useLanguage();
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedType, setSelectedType] = useState<'physical' | 'video'>('physical');
    const [searchQuery, setSearchQuery] = useState('');
    const [showBookingSuccess, setShowBookingSuccess] = useState(false);

    const doctors: Doctor[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        department: 'Cardiology',
        specialization: 'Heart Disease',
        rating: 4.8,
        experience: 15,
        consultationFee: 150,
        image: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=300',
        availableSlots: ['9:00 AM', '10:30 AM', '2:00 PM', '4:30 PM']
      },
      {
        id: '2',
        name: 'Dr. Michael Chen',
        department: 'General Medicine',
        specialization: 'Internal Medicine',
        rating: 4.9,
        experience: 12,
        consultationFee: 100,
        image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=300',
        availableSlots: ['8:30 AM', '11:00 AM', '1:30 PM', '3:00 PM']
      },
      {
        id: '3',
        name: 'Dr. Emily Rodriguez',
        department: 'Pediatrics',
        specialization: 'Child Health',
        rating: 4.7,
        experience: 10,
        consultationFee: 120,
        image: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=300',
        availableSlots: ['9:30 AM', '11:30 AM', '2:30 PM', '4:00 PM']
      }
    ];

    const handleBookAppointment = () => {
      setShowBookingSuccess(true);
      setTimeout(() => {
        setShowBookingSuccess(false);
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedTime('');
      }, 3000);
    };

    const filteredDoctors = doctors.filter(doctor =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
              Book Appointment
            </h1>
            <p className="text-gray-600 text-lg">
              Find and schedule appointments with healthcare providers
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search doctors, departments, or specializations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </motion.div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor, index) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-blue-600 font-medium">{doctor.department}</p>
                        <p className="text-gray-500 text-sm">{doctor.specialization}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                        <span className="text-gray-500 text-sm">({doctor.experience} years)</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${doctor.consultationFee}</p>
                        <p className="text-gray-500 text-sm">Consultation</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Available Today:</p>
                      <div className="flex flex-wrap gap-2">
                        {doctor.availableSlots.slice(0, 3).map((slot, slotIndex) => (
                          <span
                            key={slotIndex}
                            className="px-2 py-1 bg-emerald-100 text-emerald-600 text-xs rounded-full"
                          >
                            {slot}
                          </span>
                        ))}
                        {doctor.availableSlots.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{doctor.availableSlots.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Book Appointment
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Booking Panel */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 sticky top-24"
              >
                {selectedDoctor ? (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Book with {selectedDoctor.name}</h3>
                    
                    {/* Consultation Type */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Consultation Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setSelectedType('physical')}
                          className={`flex items-center justify-center space-x-2 p-3 rounded-lg border ${
                            selectedType === 'physical'
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-medium">In-Person</span>
                        </button>
                        <button
                          onClick={() => setSelectedType('video')}
                          className={`flex items-center justify-center space-x-2 p-3 rounded-lg border ${
                            selectedType === 'video'
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <Video className="w-4 h-4" />
                          <span className="text-sm font-medium">Video Call</span>
                        </button>
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Time Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Available Times
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedDoctor.availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedTime(slot)}
                            className={`p-2 text-sm rounded-lg border ${
                              selectedTime === slot
                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            } transition-colors`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Doctor: {selectedDoctor.name}</p>
                        <p>Type: {selectedType === 'physical' ? 'In-Person' : 'Video Call'}</p>
                        <p>Date: {selectedDate || 'Not selected'}</p>
                        <p>Time: {selectedTime || 'Not selected'}</p>
                        <p className="font-semibold text-gray-900">Fee: ${selectedDoctor.consultationFee}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleBookAppointment}
                      disabled={!selectedDate || !selectedTime}
                      className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Confirm Booking
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Doctor</h3>
                    <p className="text-gray-500">Choose a doctor from the list to book an appointment</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Success Modal */}
          {showBookingSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center"
              >
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h3>
                <p className="text-gray-600 mb-6">
                  {t('booking.success')}
                </p>
                <div className="flex items-center justify-center space-x-2 text-emerald-600 mb-4">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">WhatsApp notification sent</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };