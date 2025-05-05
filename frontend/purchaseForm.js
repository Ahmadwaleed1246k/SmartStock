import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaShoppingCart, FaTrash, FaArrowLeft } from 'react-icons/fa';
import Select from 'react-select';

const PurchaseForm = () => {
  const [voucherNo, setVoucherNo] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const compID = sessionStorage.getItem('CompID');
        if (!compID) return;

        // Get next voucher number
        const voucherRes = await fetch('http://localhost:5000/api/purchase/get-next-voucher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });
        const voucherData = await voucherRes.json();
        setVoucherNo(voucherData.nextVoucherNo);

        // Fetch suppliers
        const suppliersRes = await fetch('http://localhost:5000/api/account/get-suppliers-by-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData);

        // Ensure LocalPurchase account exists
        await fetch('http://localhost:5000/api/account/ensure-local-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });

      } catch (error) {
        console.error('Error initializing form:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSupplierChange = async (selectedOption) => {
    const supplierId = selectedOption.value;
    setSelectedSupplier(supplierId);
    
    if (supplierId) {
      // Fetch products by supplier
      const compID = sessionStorage.getItem('CompID');
      const productsRes = await fetch('http://localhost:5000/api/product/get-products-by-supplier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ SupplierID: supplierId, CompID: compID })
      });
      const productsData = await productsRes.json();
      setProducts(productsData);
    } else {
      setProducts([]);
    }
  };

  const handleProductChange = async (selectedOption) => {
    const productId = selectedOption.value;
    setSelectedProduct(productId);
    
    if (productId) {
      try {
        const response = await fetch('http://localhost:5000/api/product/get-purchase-price-by-PrdID', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ PrdID: productId })
        });

        if (!response.ok) throw new Error('Failed to fetch price');
        
        const data = await response.json();
        const priceData = Array.isArray(data) ? data[0] : data;
        
        if (priceData?.PurchasePrice) {
          setPurchasePrice(priceData.PurchasePrice);
          setTotalAmount(quantity * priceData.PurchasePrice);
        }
      } catch (error) {
        console.error('Error fetching product price:', error);
      }
    }
  };

  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value) || 0;
    setQuantity(qty);
    setTotalAmount(qty * purchasePrice);
  };

  const addPurchase = () => {
    if (selectedProduct && selectedSupplier && quantity > 0) {
      const product = products.find(p => p.PrdID == selectedProduct);
      const supplier = suppliers.find(s => s.AcctID == selectedSupplier);

      const newPurchase = {
        PrdID: selectedProduct,
        PrdName: product?.PrdName || 'N/A',
        SupplierID: selectedSupplier,
        SupplierName: supplier?.AcctName || 'N/A',
        Quantity: quantity,
        PurchasePrice: purchasePrice,
        TotalAmount: totalAmount
      };
      
      setPurchases([...purchases, newPurchase]);
      setSelectedProduct(null);
      setQuantity(0);
      setPurchasePrice(0);
      setTotalAmount(0);
    }
  };

  const submitPurchase = async () => {
    if (purchases.length > 0) {
      try {
        const compID = sessionStorage.getItem('CompID');
        const purchaseData = purchases.map(p => ({
          compid: compID,
          supplierid: p.SupplierID,
          totalamount: p.TotalAmount,
          PrdID: p.PrdID,
          Quantity: p.Quantity,
          purchasePrice: p.PurchasePrice,
          voucherDate: voucherDate
        }));

        const response = await fetch('http://localhost:5000/api/purchase/add-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(purchaseData)
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Purchase successful:', data);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Purchase submission error:', error);
      }
    }
  };

  // Format options for react-select
  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.AcctID,
    label: supplier.AcctName
  }));

  const productOptions = products.map(product => ({
    value: product.PrdID,
    label: product.PrdName
  }));

  // Custom styles for react-select components
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      minHeight: '40px',
      color: '#ffffff',
    }),
    input: (provided) => ({
      ...provided,
      color: '#ffffff',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#ffffff',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(15, 30, 45, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'rgba(79, 172, 254, 0.5)' : 'transparent',
      color: state.isFocused ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.5)',
    }),
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
      }}>
        <motion.button
                  onClick={() => navigate('/dashboard')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                      padding: '10px 20px',
                      backgroundColor: 'rgba(79, 172, 254, 0.2)',
                      color: '#4facfe',
                      border: '1px solid #4facfe',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginTop: '20px',
                      marginLeft: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                  }}
              >
                  <FaArrowLeft /> Back to Dashboard
              </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: '900px',
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
          Purchase Voucher
        </h2>

        {/* Header Fields */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '20px',
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
              Voucher No.
            </label>
            <input
              type="text"
              value={voucherNo}
              readOnly
              style={{
                width: '80%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9em'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Supplier
            </label>
            <Select
              options={supplierOptions}
              onChange={handleSupplierChange}
              value={supplierOptions.find(option => option.value === selectedSupplier)}
              isDisabled={purchases.length > 0}
              placeholder="Select Supplier"
              styles={customSelectStyles}
              isSearchable
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Purchase Account
            </label>
            <input
              type="text"
              value="Local Purchase"
              disabled={purchases.length > 0}
              readOnly
              style={{
                width: '85%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9em'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Date
            </label>
            <input
              type="date"
              value={voucherDate}
              onChange={(e) => {if(purchases.length === 0) setVoucherDate(e.target.value)}}
              style={{
                width: '85%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9em'
              }}
            />
          </div>
        </div>

        {/* Product Selection Fields */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
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
              Product
            </label>
            <Select
              options={productOptions}
              onChange={handleProductChange}
              value={selectedProduct ? productOptions.find(option => option.value === selectedProduct) : null}
              isDisabled={!selectedSupplier}
              placeholder="Select Product"
              styles={customSelectStyles}
              isSearchable
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Quantity
            </label>
            <input 
              type="number" 
              value={quantity} 
              onChange={handleQuantityChange}
              min="1"
              style={{
                width: '85%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9em'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Price
            </label>
            <input 
              type="number" 
              value={purchasePrice} 
              onChange={(e) => {
                const price = parseFloat(e.target.value) || 0;
                setPurchasePrice(price);
                setTotalAmount(quantity * price);
              }}
              min="0"
              step="0.01"
              style={{
                width: '85%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9em'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Amount
            </label>
            <input 
              type="number" 
              value={totalAmount} 
              readOnly
              style={{
                width: '85%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9em'
              }}
            />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <motion.button
            onClick={addPurchase}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!selectedProduct || !selectedSupplier || quantity <= 0}
            style={{
              padding: '10px 20px',
              backgroundColor: !selectedProduct || !selectedSupplier || quantity <= 0
                ? 'rgba(79, 172, 254, 0.4)' 
                : 'rgba(79, 172, 254, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: !selectedProduct || !selectedSupplier || quantity <= 0
                ? 'not-allowed' 
                : 'pointer',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9em'
            }}
          >
            <FaPlus /> Add Product
          </motion.button>
        </div>

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
          Purchase Items
        </h3>

        {purchases.length > 0 ? (
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
                  <th style={{ padding: '12px' }}>Product</th>
                  <th style={{ padding: '12px' }}>Supplier</th>
                  <th style={{ padding: '12px' }}>Qty</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px', width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase, index) => (
                  <tr key={index} style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <td style={{ padding: '12px' }}>{purchase.PrdName}</td>
                    <td style={{ padding: '12px' }}>{purchase.SupplierName}</td>
                    <td style={{ padding: '12px' }}>{purchase.Quantity}</td>
                    <td style={{ padding: '12px' }}>{purchase.PurchasePrice}</td>
                    <td style={{ padding: '12px' }}>{purchase.TotalAmount}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => {
                          const updatedPurchases = [...purchases];
                          updatedPurchases.splice(index, 1);
                          setPurchases(updatedPurchases);
                        }}
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
                ))}
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
            No products added to cart
          </div>
        )}

        {purchases.length > 0 && (
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <motion.button
              onClick={submitPurchase}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '10px 25px',
                backgroundColor: 'rgba(0, 200, 150, 0.8)',
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
              <FaShoppingCart /> Complete Purchase
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PurchaseForm;