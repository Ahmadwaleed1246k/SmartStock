const CompanyInfo = ({ company }) => {
    return (
      <div>
        <h2>{company.Name}</h2>
        <p>{company.Address} (Tel: {company.Tel}, Mob: {company.Mob})</p>
      </div>
    );
  };
  
  export default CompanyInfo;
  