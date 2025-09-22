import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { servicesAPI, bookingsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Calendar, Clock, DollarSign, User, ArrowLeft } from 'lucide-react';

const Booking = () => {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    bookingDate: searchParams.get('date') || '',
    startTime: searchParams.get('time') || '',
    endTime: '',
    specialRequests: [],
    notes: ''
  });

  const { data: serviceData, isLoading: serviceLoading } = useQuery(
    ['service', serviceId],
    () => servicesAPI.getById(serviceId),
    {
      enabled: !!serviceId
    }
  );

  const createBookingMutation = useMutation(
    (bookingData) => bookingsAPI.create(bookingData),
    {
      onSuccess: (response) => {
        toast.success('Booking created successfully!');
        navigate('/my-bookings');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create booking');
      }
    }
  );

  const service = serviceData?.data?.service;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecialRequestChange = (e) => {
    const value = e.target.value;
    if (value && !formData.specialRequests.includes(value)) {
      setFormData(prev => ({
        ...prev,
        specialRequests: [...prev.specialRequests, value]
      }));
      e.target.value = '';
    }
  };

  const removeSpecialRequest = (index) => {
    setFormData(prev => ({
      ...prev,
      specialRequests: prev.specialRequests.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.bookingDate || !formData.startTime) {
      toast.error('Please select date and time');
      return;
    }

    const bookingData = {
      serviceId,
      bookingDate: formData.bookingDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      specialRequests: formData.specialRequests,
      notes: formData.notes
    };

    createBookingMutation.mutate(bookingData);
  };

  if (serviceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h2>
        <p className="text-gray-600">The service you're trying to book doesn't exist.</p>
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
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-2xl font-bold text-gray-900">Complete Your Booking</h2>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Date *
                    </label>
                    <input
                      type="date"
                      name="bookingDate"
                      value={formData.bookingDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add a special request"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSpecialRequestChange(e);
                        }
                      }}
                      className="input flex-1"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleSpecialRequestChange(e)}
                      className="btn btn-outline"
                    >
                      Add
                    </button>
                  </div>
                  {formData.specialRequests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.specialRequests.map((request, index) => (
                        <span
                          key={index}
                          className="badge badge-primary flex items-center gap-1"
                        >
                          {request}
                          <button
                            type="button"
                            onClick={() => removeSpecialRequest(index)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Any additional information for the service provider..."
                    className="input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createBookingMutation.isLoading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {createBookingMutation.isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2"></div>
                      Creating Booking...
                    </div>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Booking Summary</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <p className="text-sm text-gray-600">{service.category}</p>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{service.duration} minutes</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>{service.provider?.name}</span>
                </div>

                {formData.bookingDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(formData.bookingDate).toLocaleDateString()}</span>
                  </div>
                )}

                {formData.startTime && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{formData.startTime}</span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Amount</span>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="text-xl font-bold text-primary-600">
                        {service.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;