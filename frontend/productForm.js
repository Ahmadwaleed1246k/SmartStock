import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaSearch } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';

const ProductForm = () => {
  const [product, setProduct] = useState({
    PrdName: '',
    PrdCode: '',
    GroupID: '',
    CategoryID: '',
    PurchasePrice: '',
    SalePrice: '',
    RestockLevel: '',
    Description: '',
    Suppliers: [] 
  });
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [productGroups, setProductGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
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

        // Fetch all product categories for the company
        const categoriesResponse = await fetch('http://localhost:5000/api/product-category/getProductCategoriesByCompID', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });

        if (!categoriesResponse.ok) throw new Error('Failed to fetch product categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        // Fetch products with supplier information
        const productsResponse = await fetch('http://localhost:5000/api/product/get-products-by-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });

        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        
        // Fetch suppliers for each product
        const productsWithSuppliers = await Promise.all(
          productsData.map(async (product) => {
            const suppliersResponse = await fetch('http://localhost:5000/api/supplier-product/get-suppliers-by-product', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ PrdID: product.PrdID })
            });
            
            if (suppliersResponse.ok) {
              const suppliersData = await suppliersResponse.json();
              return { ...product, Suppliers: Array.isArray(suppliersData) ? suppliersData : [] };
            }
            return product;
          })
        );
        
        setProducts(Array.isArray(productsWithSuppliers) ? productsWithSuppliers : []);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const compID = sessionStorage.getItem('CompID');
        if (!compID) return;
        
        const response = await fetch('http://localhost:5000/api/account/get-suppliers-by-compID', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });
  
        if (!response.ok) throw new Error('Failed to fetch suppliers');
        const data = await response.json();
        setSuppliers(Array.isArray(data) ? data : []);
        console.log('Suppliers:', data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };
  
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (product.GroupID) {
      const filtered = categories.filter(cat => cat.GroupID === product.GroupID);
      setFilteredCategories(filtered);
      
      if (product.CategoryID && !filtered.some(cat => cat.CategoryID === product.CategoryID)) {
        setProduct(prev => ({ ...prev, CategoryID: '' }));
      }
    } else {
      setFilteredCategories([]);
      setProduct(prev => ({ ...prev, CategoryID: '' }));
    }
  }, [product.GroupID, categories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'GroupID') {
      setProduct(prev => ({
        ...prev,
        GroupID: value,
        CategoryID: ''
      }));
      fetchCategoriesByGroupID(value);
    } else {
      setProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const fetchCategoriesByGroupID = async (groupID) => {
    try {
      const compID = sessionStorage.getItem('CompID');
      const response = await fetch('http://localhost:5000/api/product-category/getProductCategoriesByGroupID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ GroupID: groupID, CompID: compID })
      });
  
      if (!response.ok) throw new Error('Failed to fetch categories for selected group');
      const data = await response.json();
      setFilteredCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories by group ID:', error);
      setFilteredCategories([]);
    }
  };

  const fetchProductSuppliers = async (prdID) => {
    try {
      const response = await fetch('http://localhost:5000/api/supplier-product/get-suppliers-by-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PrdID: prdID })
      });
  
      if (!response.ok) throw new Error('Failed to fetch product suppliers');
      const data = await response.json();
      setProduct(prev => ({ ...prev, Suppliers: Array.isArray(data) ? data : [] }));
    } catch (error) {
      console.error('Error fetching product suppliers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    if (!product.PrdName.trim() || !product.PrdCode.trim() || !product.GroupID || 
        !product.CategoryID || product.PurchasePrice === '' || product.SalePrice === '' || 
        product.RestockLevel === '' || product.Suppliers.length === 0) {
      setError('All fields except description are required');
      return;
    }
  
    try {
      const compID = sessionStorage.getItem('CompID');
      if (!compID) {
        setError('Company ID not found');
        return;
      }
  
      if (editMode) {
        // Update existing product
        const updateResponse = await fetch('http://localhost:5000/api/product/update-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            PrdID: currentProductId,
            ...product,
            CompID: compID
          })
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.message || 'Failed to update product');
        }

        // Update supplier relationships
        // First remove all existing supplier relationships for this product
        await fetch('http://localhost:5000/api/supplier-product/remove-all-suppliers-for-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ PrdID: currentProductId })
        });

        // Then add the new supplier relationships
        if (product.Suppliers.length > 0) {
          const supplierPromises = product.Suppliers.map(supplier => 
            fetch('http://localhost:5000/api/supplier-product/add-supplier-product', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                SupplierID: supplier.AcctID, 
                PrdID: currentProductId 
              })
            })
          );
          
          await Promise.all(supplierPromises);
        }

        // Refresh products list
        const productsResponse = await fetch('http://localhost:5000/api/product/get-products-by-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });

        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        
        // Fetch suppliers for each product
        const productsWithSuppliers = await Promise.all(
          productsData.map(async (product) => {
            const suppliersResponse = await fetch('http://localhost:5000/api/supplier-product/get-suppliers-by-product', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ PrdID: product.PrdID })
            });
            
            if (suppliersResponse.ok) {
              const suppliersData = await suppliersResponse.json();
              return { ...product, Suppliers: Array.isArray(suppliersData) ? suppliersData : [] };
            }
            return product;
          })
        );
        
        setProducts(Array.isArray(productsWithSuppliers) ? productsWithSuppliers : []);

        setSuccess('Product updated successfully');
      } else {
        // Add new product
        const response = await fetch('http://localhost:5000/api/product/addProduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...product,
            CompID: compID
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add product');
        }

        // Get the newly created product ID from the response
        const responseData = await response.json();
        const newProductId = responseData.result.PrdID;

        console.log(newProductId);
        if (!newProductId) {
          throw new Error('Failed to get new product ID');
        }

        // Add supplier relationships if any suppliers are selected
        console.log(product.Suppliers);
        if (product.Suppliers.length > 0) {
          const supplierPromises = product.Suppliers.map(supplier => 
            fetch('http://localhost:5000/api/supplier-product/add-supplier-product', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                SupplierID: supplier.AcctID, 
                PrdID: newProductId ,
                CompID: compID
              })
            })
          );
          
          await Promise.all(supplierPromises);
        }

        // Refresh products list
        const productsResponse = await fetch('http://localhost:5000/api/product/get-products-by-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });

        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        
        // Fetch suppliers for each product
        const productsWithSuppliers = await Promise.all(
          productsData.map(async (product) => {
            const suppliersResponse = await fetch('http://localhost:5000/api/supplier-product/get-suppliers-by-product', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ PrdID: product.PrdID })
            });
            
            if (suppliersResponse.ok) {
              const suppliersData = await suppliersResponse.json();
              return { ...product, Suppliers: Array.isArray(suppliersData) ? suppliersData : [] };
            }
            return product;
          })
        );
        
        setProducts(Array.isArray(productsWithSuppliers) ? productsWithSuppliers : []);

        setSuccess('Product added successfully');
      }

      // Reset form
      setProduct({
        PrdName: '',
        PrdCode: '',
        GroupID: '',
        CategoryID: '',
        PurchasePrice: '',
        SalePrice: '',
        RestockLevel: '',
        Description: '',
        Suppliers: []
      });
      setEditMode(false);
      setCurrentProductId(null);

    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} product:`, error);
      setError(error.message || `Failed to ${editMode ? 'update' : 'add'} product`);
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      if(window.confirm('If you delete this it will remove all the Stock, Supplier relationships and Details associated with it. Do you confirm?')) {
        try {
      
          // Then delete the product itself
          const response = await fetch('http://localhost:5000/api/product/delete-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ PrdID: productId })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete product');
          }

          setProducts(prev => prev.filter(prod => prod.PrdID !== productId));
          setSuccess('Product and its supplier relationships deleted successfully');
          
          setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
          console.error('Error deleting product:', error);
          setError(error.message || 'Failed to delete product');
        }
      }
    }
  };

  const editProduct = (product) => {
    setProduct({
      PrdName: product.PrdName,
      PrdCode: product.PrdCode,
      GroupID: product.GroupID,
      CategoryID: product.CategoryID,
      PurchasePrice: product.PurchasePrice,
      SalePrice: product.SalePrice,
      RestockLevel: product.RestockLevel,
      Description: product.Description || '',
      Suppliers: product.Suppliers || []
    });
    setEditMode(true);
    setCurrentProductId(product.PrdID);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSupplierAdd = () => {
    console.log('Selected Supplier:', selectedSupplier);
      const currentSuppliers = Array.isArray(product.Suppliers) ? product.Suppliers : [];
    
      if (selectedSupplier && !currentSuppliers.some(s => s.AcctID === selectedSupplier)) {
        console.log("Suppliers list:", suppliers);
        console.log("Looking for supplier with AcctID:", selectedSupplier);
        
        const supplier = suppliers.find(s => Number(s.AcctID) === Number(selectedSupplier));
        console.log("Found supplier:", supplier);

        if (supplier) {
          setProduct(prev => ({
            ...prev,
            Suppliers: [...currentSuppliers, supplier]
          }));
    
          console.log(`Supplier added to product:`, {
            productName: product.PrdName,
            productCode: product.PrdCode,
            supplier
          });
          console.log("Updated Suppliers list:", product.Suppliers);
          setSelectedSupplier('');
        }
    }
    
  };
  
  const handleSupplierRemove = (supplierId) => {
    setProduct(prev => ({
      ...prev,
      Suppliers: prev.Suppliers.filter(s => s.AcctID !== supplierId)
    }));
  };

  const filteredProducts = products.filter(prod => 
    prod.PrdName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.PrdCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGroupName = (groupId) => {
    const group = productGroups.find(g => g.GroupID === groupId);
    return group ? group.GroupName : 'N/A';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.CategoryID === categoryId);
    return category ? category.CategoryName : 'N/A';
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
          maxWidth: '1200px',
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
          {editMode ? 'Edit Product' : 'Add New Product'}
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
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9em'
              }}>
                Product Name *
              </label>
              <input
                type="text"
                name="PrdName"
                value={product.PrdName}
                onChange={handleInputChange}
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
                placeholder="Enter product name"
                disabled={editMode}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9em'
              }}>
                Product Code *
              </label>
              <input
                type="text"
                name="PrdCode"
                value={product.PrdCode}
                onChange={handleInputChange}
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
                placeholder="Enter product code"
                disabled={editMode}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9em'
              }}>
                Product Group *
              </label>
              <select
                name="GroupID"
                value={product.GroupID}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.9em'
                }}
                disabled={editMode}
              >
                <option value="">Select a group</option>
                {productGroups.map(group => (
                  <option key={group.GroupID} value={group.GroupID} style={{color: 'black'}}>
                    {group.GroupName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9em'
              }}>
                Product Category *
              </label>
              <select
                name="CategoryID"
                value={product.CategoryID}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.9em'
                }}
                disabled={editMode || !product.GroupID}
              >
                <option value="">{product.GroupID ? 'Select a category' : 'First select a group'}</option>
                {filteredCategories.map(category => (
                  <option key={category.CategoryID} value={category.CategoryID} style={{color: 'black'}}>
                    {category.CategoryName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9em'
              }}>
                Purchase Price *
              </label>
              <input
                type="number"
                name="PurchasePrice"
                value={product.PurchasePrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
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
                placeholder="0.00"
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9em'
              }}>
                Sale Price *
              </label>
              <input
                type="number"
                name="SalePrice"
                value={product.SalePrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
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
                placeholder="0.00"
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9em'
              }}>
                Restock Level *
              </label>
              <input
                type="number"
                name="RestockLevel"
                value={product.RestockLevel}
                onChange={handleInputChange}
                min="0"
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
                placeholder="Minimum stock level"
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9em'
              }}>
                Description
              </label>
              <textarea
                name="Description"
                value={product.Description}
                onChange={handleInputChange}
                style={{
                  width: '93%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.9em',
                  minHeight: '60px',
                  resize: 'vertical'
                }}
                placeholder="Product description (optional)"
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9em'
              }}>
                Suppliers
              </label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select
                  value={selectedSupplier}
                  onChange={(e) => {
                    setSelectedSupplier(e.target.value);
                  }}
                  
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.9em'
                  }}
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.AcctID} value={supplier.AcctID} style={{color: 'black'}}>
                      {supplier.AcctName}
                    </option>
                  ))}
                </select>
                <motion.button
                  type="button"
                  onClick={handleSupplierAdd}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '10px',
                    backgroundColor: 'rgba(79, 172, 254, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  disabled={!selectedSupplier}
                >
                  <FaPlus />
                </motion.button>
              </div>
              
              {product.Suppliers.length > 0 && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '10px',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  {product.Suppliers.map(supplier => (
                    <div key={supplier.AcctID} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px',
                      marginBottom: '5px'
                    }}>
                      <span>{supplier.AcctName}</span>
                      <button
                        onClick={() => handleSupplierRemove(supplier.AcctID)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(255, 100, 100, 0.8)',
                          cursor: 'pointer',
                          fontSize: '1em'
                        }}
                        title="Remove"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '12px 25px',
                backgroundColor: 'rgba(79, 172, 254, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9em'
              }}
            >
              <FaPlus /> {editMode ? 'Update Product' : 'Add Product'}
            </motion.button>

            {editMode && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditMode(false);
                  setCurrentProductId(null);
                  setProduct({
                    PrdName: '',
                    PrdCode: '',
                    GroupID: '',
                    CategoryID: '',
                    PurchasePrice: '',
                    SalePrice: '',
                    RestockLevel: '',
                    Description: '',
                    Suppliers: []
                  });
                }}
                style={{
                  padding: '12px 25px',
                  backgroundColor: 'rgba(255, 100, 100, 0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9em'
                }}
              >
                Cancel Edit
              </motion.button>
            )}
          </div>
        </form>

        <div style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          margin: '30px 0',
          width: '100%'
        }}></div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            margin: 0,
            fontSize: '1.2em',
            fontWeight: '600',
            color: '#ffffff'
          }}>
            Product Inventory
          </h3>

          <div style={{
            position: 'relative',
            width: '300px'
          }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '80%',
                padding: '10px 12px 10px 35px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9em'
              }}
              placeholder="Search products..."
            />
            <FaSearch style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.5)'
            }} />
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Loading products...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              overflowX: 'auto'
            }}>
              <table style={{ 
                width: '100%',
                borderCollapse: 'collapse',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.9em',
                minWidth: '800px'
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: 'rgba(79, 172, 254, 0.2)',
                    textAlign: 'left'
                  }}>
                    <th style={{ padding: '12px' }}>Code</th>
                    <th style={{ padding: '12px' }}>Product Name</th>
                    <th style={{ padding: '12px' }}>Group</th>
                    <th style={{ padding: '12px' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Purchase</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Sale</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Restock</th>
                    <th style={{ padding: '12px' }}>Suppliers</th>
                    <th style={{ padding: '12px', width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => (
                    <tr key={prod.PrdID} style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.05)'
                      }
                    }}>
                      <td style={{ padding: '12px' }}>{prod.PrdCode}</td>
                      <td style={{ padding: '12px' }}>{prod.PrdName}</td>
                      <td style={{ padding: '12px' }}>{getGroupName(prod.GroupID)}</td>
                      <td style={{ padding: '12px' }}>{getCategoryName(prod.CategoryID)}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{parseFloat(prod.PurchasePrice).toFixed(2)}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{parseFloat(prod.SalePrice).toFixed(2)}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{prod.RestockLevel}</td>
                      <td style={{ padding: '12px' }}>
                        {prod.Suppliers && prod.Suppliers.length > 0 ? 
                          prod.Suppliers.map(s => s.AcctName).join(', ') : 
                          'N/A'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          justifyContent: 'center'
                        }}>
                          <button 
                            onClick={() => editProduct(prod)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'rgba(79, 172, 254, 0.8)',
                              cursor: 'pointer',
                              fontSize: '1em'
                            }}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => deleteProduct(prod.PrdID)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'rgba(255,100,100,0.8)',
                              cursor: 'pointer',
                              fontSize: '1em'
                            }}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ 
            padding: '20px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)'
          }}>
            {searchTerm ? 'No matching products found' : 'No products found'}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProductForm;