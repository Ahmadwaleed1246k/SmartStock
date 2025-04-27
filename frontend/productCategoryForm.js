import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash } from 'react-icons/fa';

const ProductCategoryForm = () => {
  const [categoryName, setCategoryName] = useState('');
  const [groupID, setGroupID] = useState('');
  const [categories, setCategories] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const compID = sessionStorage.getItem('CompID');
        if (!compID) {
          setError('Company ID not found in session');
          return;
        }

        // Fetch product groups
        const groupsResponse = await fetch('http://localhost:5000/api/product-group/get-all-product-groups-by-compID', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ CompID: compID })
        });

        if (!groupsResponse.ok) throw new Error('Failed to fetch product groups');
        const groupsData = await groupsResponse.json();
        setProductGroups(Array.isArray(groupsData) ? groupsData : []);

        // Fetch product categories
        const categoriesResponse = await fetch('http://localhost:5000/api/product-category/getProductCategoriesByCompID', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });

        if (!categoriesResponse.ok) throw new Error('Failed to fetch product categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!categoryName.trim() || !groupID) {
      setError('Category name and product group are required');
      return;
    }

    try {
      const compID = sessionStorage.getItem('CompID');
      if (!compID) {
        setError('Company ID not found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/product-category/addProductCategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          CategoryName: categoryName, 
          GroupID: groupID, 
          CompID: compID 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product category');
      }

      // Refresh the categories list
      const refreshResponse = await fetch('http://localhost:5000/api/product-category/getProductCategoriesByCompID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compID })
      });

      if (!refreshResponse.ok) throw new Error('Failed to refresh categories');
      const refreshedData = await refreshResponse.json();
      setCategories(Array.isArray(refreshedData) ? refreshedData : []);

      setCategoryName('');
      setGroupID('');
      setSuccess('Product category added successfully');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding product category:', error);
      setError(error.message || 'Failed to add product category');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this product category?')) {
        if(window.confirm('This will delete all Products associated with it. Do you confirm?'))
        {
      try {
        const response = await fetch('http://localhost:5000/api/product-category/delete-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ CategoryID: categoryId })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete category');
        }

        setCategories(prev => prev.filter(cat => cat.CategoryID !== categoryId));
        setSuccess('Product category deleted successfully');
        
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting category:', error);
        setError(error.message || 'Failed to delete category');
      }
    }
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      minHeight: '100vh',
      padding: '30px',
      color: '#e0e0e0'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(33, 150, 243, 0.1) 0%, transparent 50%)',
        zIndex: 0
      }}></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '25px',
          backgroundColor: 'rgba(15, 30, 45, 0.8)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <h2 style={{ 
          marginBottom: '25px',
          fontSize: '1.5em',
          fontWeight: '600',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          Manage Product Categories
        </h2>

        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: 'rgba(255, 100, 100, 0.2)',
            border: '1px solid rgba(255, 100, 100, 0.5)',
            borderRadius: '6px',
            marginBottom: '20px',
            color: '#ffcccc'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '10px',
            backgroundColor: 'rgba(100, 255, 100, 0.2)',
            border: '1px solid rgba(100, 255, 100, 0.5)',
            borderRadius: '6px',
            marginBottom: '20px',
            color: '#ccffcc'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: '15px',
            marginBottom: '30px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9em'
              }}>
                Category Name
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                style={{
                  width: '93%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.9em',
                  height: '18px'
                }}
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9em'
              }}>
                
                Product Group
              </label>
              <select
                value={groupID}
                onChange={(e) => setGroupID(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.9em',
                  
                }}
              >
                <option value="">Select a group</option>
                {productGroups.map(group => (
                  <option key={group.GroupID} value={group.GroupID} style={{color: 'black'}}>
                    {group.GroupName}
                  </option>
                ))}
              </select>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!categoryName.trim() || !groupID}
              style={{
                padding: '10px 20px',
                backgroundColor: !categoryName.trim() || !groupID
                  ? 'rgba(79, 172, 254, 0.4)' 
                  : 'rgba(79, 172, 254, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: !categoryName.trim() || !groupID ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9em',
                height: '40px'
              }}
            >
              <FaPlus /> Add Category
            </motion.button>
          </div>
        </form>

        <div style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          margin: '20px 0',
          width: '100%'
        }}></div>

        <h3 style={{ 
          marginBottom: '15px',
          fontSize: '1.2em',
          fontWeight: '600',
          color: '#ffffff'
        }}>
          Existing Product Categories
        </h3>

        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Loading product categories...
          </div>
        ) : categories.length > 0 ? (
          <div style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.9em'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: 'rgba(79, 172, 254, 0.2)',
                  textAlign: 'left'
                }}>
                  <th style={{ padding: '12px' }}>Category ID</th>
                  <th style={{ padding: '12px' }}>Category Name</th>
                  <th style={{ padding: '12px' }}>Group</th>
                  <th style={{ padding: '12px', width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const group = productGroups.find(g => g.GroupID === category.GroupID);
                  return (
                    <tr key={category.CategoryID} style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <td style={{ padding: '12px' }}>{category.CategoryID}</td>
                      <td style={{ padding: '12px' }}>{category.CategoryName || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{group?.GroupName || 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => deleteCategory(category.CategoryID)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,100,100,0.8)',
                            cursor: 'pointer',
                            fontSize: '1em'
                          }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            padding: '20px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)'
          }}>
            No product categories found
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProductCategoryForm;