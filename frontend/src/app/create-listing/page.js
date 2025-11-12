"use client"

import React, { useState } from 'react';

export default function CreateListing() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    locationId: 'test-location-1',
    hostId: 'test-host-1',
    pictures: ['default.jpg'],
    numOfBeds: 1,
    price: 100,
    saleAmount: 0,
    locationType: 'HOUSE',
    amenityIds: ['amenity-1'],
    categoryIds: [],
    checkInDate: '',
    checkOutDate: '',
    listingStatus: 'ACTIVE',
    isFeatured: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:4040/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateListing($input: CreateListingInput!) {
              createListing(input: $input) {
                code
                success
                message
                listing {
                  id
                  title
                  description
                  price
                }
              }
            }
          `,
          variables: {
            input: formData
          }
        })
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        alert('创建房源失败: ' + result.errors[0].message);
      } else {
        console.log('创建成功:', result.data.createListing);
        alert('房源创建成功!');
      }
    } catch (error) {
      console.error('请求错误:', error);
      alert('网络错误，请重试');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">创建房源</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">房源标题</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">描述</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">床位数</label>
          <input
            type="number"
            name="numOfBeds"
            value={formData.numOfBeds}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">价格</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">入住日期</label>
          <input
            type="date"
            name="checkInDate"
            value={formData.checkInDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">退房日期</label>
          <input
            type="date"
            name="checkOutDate"
            value={formData.checkOutDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">房源类型</label>
          <select
            name="locationType"
            value={formData.locationType}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="HOUSE">房屋</option>
            <option value="APARTMENT">公寓</option>
            <option value="COTTAGE">小屋</option>
            <option value="VILLA">别墅</option>
            <option value="ROOM">房间</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          创建房源
        </button>
      </form>
    </div>
  );
}