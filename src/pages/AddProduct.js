import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { productsAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, X, Plus, Minus } from 'lucide-react';

const AddProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    species: '',
    morph: '',
    age: '',
    size: { length: '', unit: 'inches' },
    weight: '',
    price: '',
    stock: '',
    features: [],
    careInstructions: {
      temperature: { hot: '', cool: '' },
      humidity: '',
      feeding: '',
      housing: ''
    },
    healthGuarantee: '',
    shipping: { available: true, cost: '', estimatedDays: '' },
    tags: [],
    isActive: true
  });

  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [images, setImages] = useState([]);

  const categories = [
    { value: 'ball_python', label: 'Ball Python' },
    { value: 'corn_snake', label: 'Corn Snake' },
    { value: 'king_snake', label: 'King Snake' },
    { value: 'boa_constrictor', label: 'Boa Constrictor' },
    { value: 'milk_snake', label: 'Milk Snake' },
    { value: 'garter_snake', label: 'Garter Snake' }
  ];

  const ages = [
    { value: 'hatchling', label: 'Hatchling (0-6 months)' },
    { value: 'juvenile', label: 'Juvenile (6-18 months)' },
    { value: 'sub_adult', label: 'Sub-Adult (1.5-3 years)' },
    { value: 'adult', label: 'Adult (3+ years)' }
  ];

  const createProductMutation = useMutation(productsAPI.create, {
    onSuccess: () => {
      toast.success('Product added successfully!');
      queryClient.invalidateQueries('admin-products');
      navigate('/admin');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      alt: file.name,
      isPrimary: images.length === 0
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: i === index
    })));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert form data to match API expectations
    const productData = {
      ...formData,
      size: {
        length: parseFloat(formData.size.length),
        unit: formData.size.unit
      },
      weight: parseFloat(formData.weight),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      shipping: {
        ...formData.shipping,
        cost: parseFloat(formData.shipping.cost),
        estimatedDays: parseInt(formData.shipping.estimatedDays)
      },
      images: images.map(img => ({
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary
      }))
    };

    createProductMutation.mutate(productData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Snake Product</h1>
        <p className="text-gray-600 mt-2">Add a new snake to your inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          <div className="card-content space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input"
                  placeholder="e.g., Ball Python - Pastel Morph"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="input"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="input"
                placeholder="Describe the snake's characteristics, temperament, and care requirements..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species *
                </label>
                <input
                  type="text"
                  required
                  value={formData.species}
                  onChange={(e) => handleInputChange('species', e.target.value)}
                  className="input"
                  placeholder="e.g., Python regius"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Morph
                </label>
                <input
                  type="text"
                  value={formData.morph}
                  onChange={(e) => handleInputChange('morph', e.target.value)}
                  className="input"
                  placeholder="e.g., Pastel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <select
                  required
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="input"
                >
                  <option value="">Select Age</option>
                  {ages.map(age => (
                    <option key={age.value} value={age.value}>{age.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Physical Characteristics */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Physical Characteristics</h3>
          </div>
          <div className="card-content space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length (inches) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.size.length}
                  onChange={(e) => handleInputChange('size.length', e.target.value)}
                  className="input"
                  placeholder="18"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (grams)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="input"
                  placeholder="800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  className="input"
                  placeholder="5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="input"
                  placeholder="150.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.shipping.cost}
                  onChange={(e) => handleInputChange('shipping.cost', e.target.value)}
                  className="input"
                  placeholder="25.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Features</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="input flex-1"
                  placeholder="Add a feature (e.g., Great temperament)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="btn btn-outline cursor-pointer inline-flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(index)}
                        className={`btn btn-sm ${image.isPrimary ? 'btn-primary' : 'btn-outline'}`}
                      >
                        {image.isPrimary ? 'Primary' : 'Set Primary'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="btn btn-sm btn-danger"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createProductMutation.isLoading}
            className="btn btn-primary"
          >
            {createProductMutation.isLoading ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;