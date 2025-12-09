"use client";

import React, { useState } from 'react';
import { useSession } from "next-auth/react";

const BecomeHostApplication = ({ session }) => {
  // We still need updateSession to refresh the session after submission
  const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';

  const { update: updateSession } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Taro',
    lastName: 'Yamada',
    phoneNumber: '080-1234-5678',
    address: 'Shibuya 1-1-1',
    city: 'Tokyo',
    country: 'Japan',
    experience: 'Hosted on other platforms for 3 years.',
    motivation: 'I enjoy meeting people from all over the world.',
    agreeToTerms: true
  });
  const [myNumberCardFront, setMyNumberCardFront] = useState(null);
  const [myNumberCardBack, setMyNumberCardBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // GraphQL mutation for becoming a host
  // const BECOME_HOST_MUTATION = `
  //   mutation BecomeHost($userId: ID!, $myNumberCardFront: String, $myNumberCardBack: String) {
  //     becomeHost(userId: $userId, myNumberCardFront: $myNumberCardFront, myNumberCardBack: $myNumberCardBack) {
  //       success
  //       message
  //       user {
  //         id
  //         email
  //         role
  //         status
  //       }
  //     }
  //   }
  // `;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB');
        return;
      }
      
      if (type === 'front') {
        setMyNumberCardFront(file);
      } else if (type === 'back') {
        setMyNumberCardBack(file);
      }
    }
  };

  const removeFile = (type) => {
    if (type === 'front') {
      setMyNumberCardFront(null);
    } else if (type === 'back') {
      setMyNumberCardBack(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit triggered');
    console.log('Current form data:', formData);
    console.log('Session object state during handleSubmit:', session);
    
    if (!session?.user?.id) {
      setMessage('Please log in to apply to become a host.');
      return;
    }

    if (!formData.agreeToTerms) {
      console.log('Validation failed: agreeToTerms is false.');
      setMessage('Please agree to the terms and conditions.');
      return;
    }

    // Validate My Number Card uploads
    if (!myNumberCardFront || !myNumberCardBack) {
      console.log('Validation failed: My Number Card files missing.');
      setMessage('Please upload both front and back sides of your My Number Card.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // // First, upload the My Number Card images
      // const uploadPromises = [
      //   uploadFile(myNumberCardFront, 'my_number_card_front'),
      //   uploadFile(myNumberCardBack, 'my_number_card_back')
      // ];

      const [frontUrl, backUrl] = await Promise.all(uploadPromises);

      // Then submit the application with the image URLs
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        // body: JSON.stringify({
        //   query: BECOME_HOST_MUTATION,
        //   variables: {
        //     myNumberCardFront: frontUrl,
        //     myNumberCardBack: backUrl
        //   },
        // }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('Error applying to become host:', result.errors);
        setMessage('Failed to submit application: ' + result.errors[0].message);
        return;
      }

      if (result.data?.becomeHost?.success) {
        setMessage('✅ Application submitted successfully! Your application is now pending admin approval.');
        setIsOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          address: '',
          city: '',
          country: '',
          experience: '',
          motivation: '',
          agreeToTerms: false
        });
        setMyNumberCardFront(null);
        setMyNumberCardBack(null);

        // 手动触发会话更新，以反映最新的用户角色
        await updateSession();
      } else {
        setMessage('Failed to submit application: ' + result.data?.becomeHost?.message);
      }
    } catch (error) {
      console.error('Error applying to become host:', error);
      setMessage('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // const uploadFile = async (file) => {
  //   if (!session?.user?.id) {
  //     throw new Error("You must be signed in to upload files.");
  //   }

  //   // Step 1: Get the presigned URL from the gateway
  //   const presignResponse = await fetch(`${GATEWAY_URL}/file/presign-url`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       userId: session.user.id,
  //       fileType: file.type.split('/')[1] || 'jpeg',
  //     }),
  //   });

  //   if (!presignResponse.ok) {
  //     const errorData = await presignResponse.json();
  //     throw new Error(errorData.error || 'Failed to get presigned URL.');
  //   }

  //   const { uploadUrl, key } = await presignResponse.json();

  //   // Step 2: Upload the file directly to Google Cloud Storage
  //   const uploadResponse = await fetch(uploadUrl, {
  //     method: 'PUT',
  //     headers: { 'Content-Type': file.type },
  //     body: file,
  //   });

  //   if (!uploadResponse.ok) throw new Error('File upload to GCS failed.');

  //   return key; // Return the GCS object key
  // };

  // Check if user is already a host or pending host
  const userRole = session?.user?.role || 'GUEST';
  
  if (userRole === 'HOST') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-800 font-medium">🎉 You are already a verified host!</p>
        <p className="text-green-600 text-sm mt-1">You can now create listings and manage your properties.</p>
        <a href="/create-listing" className="text-green-600 hover:underline mt-2 inline-block">
          Create your first listing
        </a>
      </div>
    );
  }

  if (userRole === 'PENDING_HOST') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800 font-medium">⏳ Your host application is pending approval</p>
        <p className="text-yellow-600 text-sm mt-1">Our admin team will review your application shortly.</p>
        <p className="text-yellow-500 text-xs mt-2">Status: Pending Admin Review</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Application Trigger */}
      <div className="p-6 text-center">
        <div className="text-4xl mb-3">🏠</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Become a Host</h3>
        <p className="text-gray-600 mb-4">Share your space, earn extra income, and join our community of hosts</p>
        
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Apply to Become a Host
        </button>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-gray-500">
          <div className="flex items-center">
            <span className="mr-1">✓</span> Earn extra income
          </div>
          <div className="flex items-center">
            <span className="mr-1">✓</span> Flexible schedule
          </div>
          <div className="flex items-center">
            <span className="mr-1">✓</span> Support team
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Apply to Become a Host</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mt-1">Fill out the form below to start your hosting journey</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {message && (
                <div className={`p-3 rounded ${
                  message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your country"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hosting Experience
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about your previous hosting experience (if any)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Why do you want to become a host? *
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your motivation for becoming a host..."
                />
              </div>

              {/* My Number Card Upload Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📇 My Number Card Verification</h4>
                <p className="text-sm text-gray-600 mb-4">
                  For security and verification purposes, please upload clear photos of both sides of your My Number Card.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Front Side */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      My Number Card - Front Side *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                      {myNumberCardFront ? (
                        <div className="space-y-2">
                          <div className="text-green-600 text-sm">✓ File uploaded</div>
                          <div className="text-xs text-gray-500 truncate">{myNumberCardFront.name}</div>
                          <button
                            type="button"
                            onClick={() => removeFile('front')}
                            className="text-red-600 text-xs hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-2xl mb-2">📷</div>
                          <p className="text-sm text-gray-600">Upload front side photo</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'front')}
                            className="hidden"
                            id="myNumberCardFront"
                          />
                          <label
                            htmlFor="myNumberCardFront"
                            className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm cursor-pointer hover:bg-blue-700"
                          >
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back Side */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      My Number Card - Back Side *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                      {myNumberCardBack ? (
                        <div className="space-y-2">
                          <div className="text-green-600 text-sm">✓ File uploaded</div>
                          <div className="text-xs text-gray-500 truncate">{myNumberCardBack.name}</div>
                          <button
                            type="button"
                            onClick={() => removeFile('back')}
                            className="text-red-600 text-xs hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-2xl mb-2">📷</div>
                          <p className="text-sm text-gray-600">Upload back side photo</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'back')}
                            className="hidden"
                            id="myNumberCardBack"
                          />
                          <label
                            htmlFor="myNumberCardBack"
                            className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm cursor-pointer hover:bg-blue-700"
                          >
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> Ensure the photos are clear and all information is readable. 
                    Your My Number Card will be used for identity verification only and will be handled securely.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
                <label className="text-sm text-gray-600">
                  I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and 
                  <a href="#" className="text-blue-600 hover:underline"> Host Agreement</a>. I understand that my 
                  application will be reviewed by the admin team.
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.agreeToTerms}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BecomeHostApplication;