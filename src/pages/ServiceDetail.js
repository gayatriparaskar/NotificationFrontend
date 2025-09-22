import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { servicesAPI, bookingsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Clock, DollarSign, MapPin, Star, Calendar, User, ArrowLeft } from 'lucide-react';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const { data: serviceData, isLoading: serviceLoading } = useQuery(
    ['service', id],
    () => servicesAPI.getById(id),
    {
      enabled: !!id
    }
  );

  const { data: availabilityData, isLoading: availabilityLoading } = useQuery(
    ['availability', id, selectedDate],
    () => bookingsAPI.getAvailability(id, selectedDate),
    {
      enabled: !!id && !!selectedDate
    }
  );

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book this service');
      navigate('/login');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    navigate(`/booking/${id}?date=${selectedDate}&time=${selectedTime}`);
  };

  if (serviceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const service = serviceData?.data?.service;
  const availableSlots = availabilityData?.data?.availableSlots || [];

  if (!service) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h2>
        <p className="text-gray-600">The service you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Services
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Service Details */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-content">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {service.name}
                  </h1>
                  <span className="badge badge-primary text-sm">
                    {service.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600">
                    ${service.price}
                  </div>
                  <div className="text-sm text-gray-500">per session</div>
                </div>
              </div>

              <div className="flex items-center text-gray-600 mb-6">
                <Clock className="h-5 w-5 mr-2" />
                <span className="mr-6">{service.duration} minutes</span>
                <User className="h-5 w-5 mr-2" />
                <span>{service.provider?.name}</span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {service.requirements && service.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {service.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Provider Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="font-medium">{service.provider?.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{service.provider?.address?.city || 'Location not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <div className="card-header">
              <h3 className="text-xl font-semibold text-gray-900">Book This Service</h3>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Times
                  </label>
                  {availabilityLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner"></div>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedTime(slot.startTime)}
                          className={`p-2 text-sm rounded border ${
                            selectedTime === slot.startTime
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-gray-300 hover:border-primary-300'
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No available slots for this date</p>
                  )}
                </div>
              )}

              <button
                onClick={handleBookNow}
                disabled={!selectedDate || !selectedTime}
                className="btn btn-primary btn-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Now
              </button>

              <div className="text-xs text-gray-500 text-center">
                You will be redirected to complete your booking
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;