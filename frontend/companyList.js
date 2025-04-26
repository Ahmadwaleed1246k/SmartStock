import CompanyInfo from './companyInfo';

const CompanyList = ({ companies }) => {
  return (
    <div>
      <h1>Company List</h1>
      {companies.map((company) => (
        <CompanyInfo key={company.CompID} company={company} />
      ))}
    </div>
  );
};

export default CompanyList;
