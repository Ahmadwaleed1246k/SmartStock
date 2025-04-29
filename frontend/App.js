import { Route, Routes } from 'react-router-dom';
import LoginForm from './Components/loginForm';
import CompanyForm from './Components/companyForm';
import DashBoard from './Components/DashBoard';
import PurchaseForm from './Components/purchaseForm';
import SaleForm from './Components/saleForm';
import Reports from './Components/Reports';
//import StockReport from './Components/reports/stockReport';
//import ProductLedgerReport from './Components/reports/productLedgerReport';
//import AccountLedgerReport from './Components/reports/accountLedgerReport';
//import DayBookReport from './Components/reports/dayBookReport';
import ProductGroupForm from './Components/productGroupForm';
import ProductCategoryForm from './Components/productCategoryForm';
import ProductForm from './Components/productForm';
import PaymentForm from './Components/PaymentForm';
import SuppliersPage from './Components/SuppliersPage';
import CustomersPage from './Components/CustomerPage';
import EmployeesPage from './Components/EmployeePage';
//import LoginForm from './Components/loginForm';
//import CompanyForm from './Components/companyForm';
//import DashBoard from './Components/DashBoard';
import Suppliers from './Components/suppliers';
//import Reports from './Components/Reports';
// Import the new report components
import StockReport from './Components/StockReport';
import ProductLedgerReport from './Components/ProductLedgerReport';
import ProductSelection from './Components/ProductSelection'; // Add this import
import AccountLedgerReport from './Components/AccountLedgerReport';
import AccountSelection from './Components/AccountSelection'; // <-- ADD THIS
import DayBookReport from './Components/DayBookReport';

function App() {
  return (
    <Routes>
      {/* Keep all your existing routes exactly as they are */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/create-company" element={<CompanyForm />} />
      <Route path="/dashboard" element={<DashBoard />} />
      <Route path="/suppliers" element={<SuppliersPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/purchases" element={<PurchaseForm />} />
      <Route path="/suppliers" element={<Suppliers />} />
      <Route path="/sales" element={<SaleForm />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/" element={<LoginForm />} />

      {/* Add these new report sub-routes */}
      <Route path="/reports/stock" element={<StockReport />} />
      <Route path="/product-ledger" element={<ProductLedgerReport />} />
      <Route path="/product-ledger/:productId" element={<ProductLedgerReport />} />
      // Add these routes
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="/account-ledger" element={<AccountSelection />} />
      <Route path="/account-ledger/:accountId" element={<AccountLedgerReport />} />
      <Route path="/day-book" element={<DayBookReport />} />
      <Route path="/product-groups" element={<ProductGroupForm />} />
      <Route path="/product-category" element={<ProductCategoryForm />} />
      <Route path='/product' element={<ProductForm />} />
      <Route path='/payment' element={<PaymentForm />} />
    </Routes>
  );
}

export default App;