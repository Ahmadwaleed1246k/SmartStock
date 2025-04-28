import { Route, Routes } from 'react-router-dom';
import LoginForm from './Components/loginForm';
import CompanyForm from './Components/companyForm';
import DashBoard from './Components/DashBoard';
import PurchaseForm from './Components/purchaseForm';
import SaleForm from './Components/saleForm';
import Reports from './Components/reports';
import StockReport from './Components/reports/stockReport';
import ProductLedgerReport from './Components/reports/productLedgerReport';
import AccountLedgerReport from './Components/reports/accountLedgerReport';
import DayBookReport from './Components/reports/dayBookReport';
import ProductGroupForm from './Components/productGroupForm';
import ProductCategoryForm from './Components/productCategoryForm';
import ProductForm from './Components/productForm';
import PaymentForm from './Components/PaymentForm';
import SuppliersPage from './Components/SuppliersPage';
import CustomersPage from './Components/CustomerPage';
import EmployeesPage from './Components/EmployeePage';
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/create-company" element={<CompanyForm />} />
      <Route path="/dashboard" element={<DashBoard />} />
      <Route path="/suppliers" element={<SuppliersPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/purchases" element={<PurchaseForm />} />
      <Route path="/sales" element={<SaleForm />} />
      <Route path="/" element={<LoginForm />} />
      <Route path="/reports" element={<Reports />} />
      {/* Add these new report sub-routes */}
      <Route path="/reports/stock" element={<StockReport />} />
      <Route path="/reports/product-ledger/:productId" element={<ProductLedgerReport />} />
      <Route path="/reports/account-ledger/:accountId" element={<AccountLedgerReport />} />
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="/reports/day-book" element={<DayBookReport />} />
      <Route path="/product-groups" element={<ProductGroupForm />} />
      <Route path="/product-category" element={<ProductCategoryForm />} />
      <Route path='/product' element={<ProductForm />} />
      <Route path='/payment' element={<PaymentForm />} />
    </Routes>
  );
}

export default App;
