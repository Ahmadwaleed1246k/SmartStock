import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaShoppingCart, FaTrash } from 'react-icons/fa';
import Select from 'react-select';

const SaleForm = () => {
  const [voucherNo, setVoucherNo] = useState('Loading...');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stockQuantities, setStockQuantities] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const compID = sessionStorage.getItem('CompID');
        if (!compID) return;

        // Get next voucher number
        const voucherRes = await fetch('http://localhost:5000/api/sale/get-next-voucher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });
        const voucherData = await voucherRes.json();
        console.log('Voucher data:', voucherData); // Debug log
        setVoucherNo(voucherData.VoucherNo || 'N/A');

        // Fetch customers
        const customersRes = await fetch('http://localhost:5000/api/account/get-customers-by-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });
        const customersData = await customersRes.json();
        setCustomers(customersData);

        // Ensure LocalSale account exists
        await fetch('http://localhost:5000/api/account/ensure-local-sale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });

        // Fetch products
        const productsRes = await fetch('http://localhost:5000/api/product/get-products-by-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });
        const productsData = await productsRes.json();
        setProducts(productsData);

        // Fetch stock for all products
        const stockPromises = productsData.map(product => 
          fetch('http://localhost:5000/api/product/get-current-stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ PrdID: product.PrdID, CompID: compID })
          })
        );
        
        const stockResponses = await Promise.all(stockPromises);
        const stockData = await Promise.all(stockResponses.map(res => res.json()));

        const newStockQuantities = {};
        productsData.forEach((product, index) => {
          newStockQuantities[product.PrdID] = stockData[index]?.StockQuantity || 0;
        });
        setStockQuantities(newStockQuantities);
        console.log('Stock quantities:', newStockQuantities); // Debug log

      } catch (error) {
        console.error('Error initializing form:', error);
        setVoucherNo('Error loading');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleProductChange = async (selectedOption) => {
    const productId = selectedOption.value;
    setSelectedProduct(productId);
    
    if (productId) {
      try {
        const response = await fetch('http://localhost:5000/api/product/get-sale-price-by-PrdID', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ PrdID: productId })
        });

        if (!response.ok) throw new Error('Failed to fetch price');
        
        const data = await response.json();
        const priceData = Array.isArray(data) ? data[0] : data;
        
        if (priceData?.SalePrice) {
          setSalePrice(priceData.SalePrice);
          calculateTotalAmount(quantity, priceData.SalePrice, discount);
        }
      } catch (error) {
        console.error('Error fetching product price:', error);
      }
    }
  };

  const calculateTotalAmount = (qty, price, disc) => {
    const subtotal = qty * price;
    const discountedAmount = subtotal - (subtotal * (disc / 100));
    setTotalAmount(discountedAmount);
  };

  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value) || 0;
    setQuantity(qty);
    calculateTotalAmount(qty, salePrice, discount);

    // Check stock availability
    if (selectedProduct && stockQuantities[selectedProduct] !== undefined && qty > stockQuantities[selectedProduct]) {
      alert(`Warning: Quantity (${qty}) exceeds available stock (${stockQuantities[selectedProduct]})`);
      setQuantity(0);
      calculateTotalAmount(0, salePrice, discount);
    }
  };

  const handleDiscountChange = (e) => {
    const disc = parseFloat(e.target.value) || 0;
    if(disc > 100) 
    {
      setDiscount(100);
      calculateTotalAmount(quantity, salePrice, 100);
    }
    else 
    {
      setDiscount(disc);
      calculateTotalAmount(quantity, salePrice, disc);
    }
    
  };

  const addSale = () => {
    if (selectedProduct && selectedCustomer && quantity > 0) {
      // Check stock availability
      if (stockQuantities[selectedProduct] !== undefined && quantity > stockQuantities[selectedProduct]) {
        alert(`Cannot add sale: Quantity (${quantity}) exceeds available stock (${stockQuantities[selectedProduct]})`);
        return;
      }

      const product = products.find(p => p.PrdID == selectedProduct);
      const customer = customers.find(c => c.AcctID == selectedCustomer);

      const newSale = {
        PrdID: selectedProduct,
        PrdName: product?.PrdName || 'N/A',
        CustomerID: selectedCustomer,
        CustomerName: customer?.AcctName || 'N/A',
        Quantity: quantity,
        SalePrice: salePrice,
        Discount: discount,
        TotalAmount: totalAmount
      };

      setStockQuantities({
        ...stockQuantities,
        [selectedProduct]: stockQuantities[selectedProduct] - quantity
      });
      
      setSales([...sales, newSale]);
      setSelectedProduct(null);
      setQuantity(0);
      setSalePrice(0);
      setDiscount(0);
      setTotalAmount(0);
    }
  };

  const submitSale = async () => {
    if (sales.length > 0 && selectedCustomer) {
      try {
        const compID = sessionStorage.getItem('CompID');
        const saleData = sales.map(sale => ({
          compid: compID,
          customerid: sale.CustomerID,
          salePrice: sale.SalePrice,
          totalamount: sale.TotalAmount,
          discount: sale.Discount,
          PrdID: sale.PrdID,
          Quantity: sale.Quantity,
          voucherDate: voucherDate
        }));

        const response = await fetch('http://localhost:5000/api/sale/add-sale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saleData)
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Sale successful:', data);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Sale submission error:', error);
      }
    }
  };

  // Format options for react-select
  const customerOptions = customers.map(customer => ({
    value: customer.AcctID,
    label: customer.AcctName
  }));

  const productOptions = products.map(product => ({
    value: product.PrdID,
    label: product.PrdName,
    stock: stockQuantities[product.PrdID] || 0
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
      }}></div>

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
       Sale Voucher
        </h2>

        {/* Header Fields */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
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
            {voucherNo ? (
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
            ) : (
              <div style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
                Loading voucher...
              </div>
            )}
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Customer
            </label>
            <Select
              options={customerOptions}
              onChange={(selected) => setSelectedCustomer(selected.value)}
              value={customerOptions.find(option => option.value === selectedCustomer)}
              isDisabled={sales.length > 0}
              placeholder="Select Customer"
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
              Sale Account
            </label>
            <input
              type="text"
              value="Local Sale"
              readOnly
              disabled
              style={{
                width: '90%',
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
              onChange={(e) => {if(sales.length === 0) setVoucherDate(e.target.value)}}
              style={{
                width: '90%',
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
              Product
            </label>
            <Select
            options={productOptions}
            onChange={handleProductChange}
            value={selectedProduct ? productOptions.find(option => option.value === selectedProduct) : null}
            placeholder="Select Product"
            styles={customSelectStyles}
            isSearchable
            formatOptionLabel={(option) => (
              <div>
                <div>{option.label}</div>
                <div style={{ fontSize: '0.8em', color: '#aaa' }}>
                  Stock: {option.stock}
                </div>
              </div>
            )}
          />
          </div>
        </div>

        {/* Product Selection Fields */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
          gap: '50px',
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
              Quantity
            </label>
            <input 
              type="number" 
              value={quantity} 
              onChange={handleQuantityChange}
              min="1"
              style={{
                width: '100%',
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
              fontSize: '0.9em',
            
            }}>
              Price
            </label>
            <input 
              type="number" 
              value={salePrice} 
              onChange={(e) => {
                const price = parseFloat(e.target.value) || 0;
                setSalePrice(price);
                calculateTotalAmount(quantity, price, discount);
              }}
              min="0"
              step="0.01"
              style={{
                width: '100%',
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
              Discount (%)
            </label>
            <input 
              type="number" 
              value={discount} 
              onChange={handleDiscountChange}
              min="0"
              max="100"
              style={{
                width: '100%',
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
                width: '100%',
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
            onClick={addSale}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!selectedProduct || !selectedCustomer || quantity <= 0}
            style={{
              padding: '10px 20px',
              backgroundColor: !selectedProduct || !selectedCustomer || quantity <= 0
                ? 'rgba(79, 172, 254, 0.4)' 
                : 'rgba(79, 172, 254, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: !selectedProduct || !selectedCustomer || quantity <= 0
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
          Sale Items
        </h3>

        {sales.length > 0 ? (
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
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Qty</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Discount</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px', width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr key={index} style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <td style={{ padding: '12px' }}>{sale.PrdName}</td>
                    <td style={{ padding: '12px' }}>{sale.CustomerName}</td>
                    <td style={{ padding: '12px' }}>{sale.Quantity}</td>
                    <td style={{ padding: '12px' }}>{sale.SalePrice}</td>
                    <td style={{ padding: '12px' }}>{sale.Discount}%</td>
                    <td style={{ padding: '12px' }}>{sale.TotalAmount}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => {
                          const updatedSales = [...sales];
                          const deletedSale = updatedSales.splice(index, 1)[0];
    
                          // Restore the stock quantity
                          setStockQuantities(prev => ({
                            ...prev,
                            [deletedSale.PrdID]: (prev[deletedSale.PrdID] || 0) + deletedSale.Quantity
                          }));

                          setSales(updatedSales);
                          setSelectedProduct(null); 
                          setQuantity(0);
                          setSalePrice(0);
                          setDiscount(0);
                          setTotalAmount(0);
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

        {sales.length > 0 && (
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <motion.button
              onClick={submitSale}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={!selectedCustomer}
              style={{
                padding: '10px 25px',
                backgroundColor: !selectedCustomer
                  ? 'rgba(0, 200, 150, 0.4)'
                  : 'rgba(0, 200, 150, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: !selectedCustomer
                  ? 'not-allowed'
                  : 'pointer',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9em'
              }}
            >
              <FaShoppingCart /> Complete Sale
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SaleForm;
