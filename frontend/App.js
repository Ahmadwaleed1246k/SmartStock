import { Route, Routes } from 'react-router-dom';
import LoginForm from './Components/loginForm';
import CompanyForm from './Components/companyForm';
import DashBoard from './Components/DashBoard';
import EmployeesPage from './Components/EmployeesPage';
import AddEmployeePage from './Components/AddEmployeePage';
import SuppliersPage from './Components/SuppliersPage';
import CustomersPage from './Components/CustomersPage';


function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/create-company" element={<CompanyForm />} />
      <Route path="/dashboard" element={<DashBoard />} />
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="/add-employee" element={<AddEmployeePage />} />
      <Route path="/suppliers" element={<SuppliersPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/" element={<LoginForm />} />
    </Routes>
  );
}

export default App;



