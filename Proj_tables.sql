
CREATE TABLE Company (
  CompID INT PRIMARY KEY IDENTITY(1,1),
  Name NVARCHAR(100) UNIQUE NOT NULL,
  Address NVARCHAR(255),
  Tel NVARCHAR(15) CHECK(LEN(Tel) = 10),
  Mob NVARCHAR(15) CHECK (LEN(Mob) = 11),
  DateOfRegistration DATETIME DEFAULT GETDATE()
);


CREATE TABLE Users (
  UserID INT PRIMARY KEY IDENTITY(1,1),
  Username NVARCHAR(50) UNIQUE NOT NULL CHECK (LEN(UserName) >= 3),
  Password VARBINARY(255) NOT NULL,
  UserRole NVARCHAR(20) CHECK (UserRole IN ('Admin', 'Employee')),
  CompID INT,
  CONSTRAINT FK_Users_Company FOREIGN KEY (CompID) REFERENCES Company(CompID) ON DELETE CASCADE
);

CREATE TABLE ProductGroup (
  GroupID INT PRIMARY KEY IDENTITY(1,1),
  GroupName NVARCHAR(100) UNIQUE NOT NULL,
  CompID int
  CONSTRAINT FK_PrdGroup_Company FOREIGN KEY (CompID) REFERENCES Company(CompID) ON DELETE CASCADE
);

CREATE TABLE Accounts (
  AcctID INT PRIMARY KEY IDENTITY(1,1),
  AcctName NVARCHAR(100) NOT NULL,
  Address NVARCHAR(255),
  Tel NVARCHAR(15) CHECK(LEN(Tel) = 10),
  Mob NVARCHAR(15) CHECK (LEN(Mob) = 11),
  Email NVARCHAR(100) UNIQUE CHECK(Email LIKE '%@%.%'),
  CompID INT,
  AcctType NVARCHAR(20), --Supplier, Customer, Local Purchase, Local Sale 
  CONSTRAINT FK_Accounts_Company FOREIGN KEY (CompID) REFERENCES Company(CompID) ON DELETE CASCADE
);

CREATE TABLE ProductCategory (
  CategoryID INT PRIMARY KEY IDENTITY(1,1),
  CategoryName NVARCHAR(100) UNIQUE NOT NULL,
  GroupID INT,
  CompID INT,
  CONSTRAINT FK_Category_Group FOREIGN KEY (GroupID) REFERENCES ProductGroup(GroupID),
  CONSTRAINT FK_PrdCat_Company FOREIGN KEY (CompID) REFERENCES Company(CompID) ON DELETE CASCADE
);

CREATE TABLE Products (
  PrdID INT PRIMARY KEY IDENTITY(1,1),
  PrdName NVARCHAR(100) NOT NULL,
  PrdCode NVARCHAR(50) UNIQUE NOT NULL,
  GroupID INT,
  CategoryID INT,
  PurchasePrice DECIMAL(18, 2) NOT NULL,
  SalePrice DECIMAL(18, 2) NOT NULL,
  RestockLevel INT NOT NULL,
  Description NVARCHAR(MAX),
  ImageURL NVARCHAR(255),
  CompID INT,
  CONSTRAINT FK_Products_Group FOREIGN KEY (GroupID) REFERENCES ProductGroup(GroupID),
  CONSTRAINT FK_Products_Category FOREIGN KEY (CategoryID) REFERENCES ProductCategory(CategoryID),
  CONSTRAINT FK_Products_Company FOREIGN KEY (CompID) REFERENCES Company(CompID) ON DELETE CASCADE
);

CREATE TABLE Stock (
  StockID INT PRIMARY KEY IDENTITY(1,1),
  CompID INT,
  PrdID INT,
  StockQuantity INT NOT NULL,
  LastUpdated DATETIME DEFAULT GETDATE(),
  CONSTRAINT FK_Stock_Company FOREIGN KEY (CompID) REFERENCES Company(CompID) ON DELETE CASCADE,
  CONSTRAINT FK_Stock_Product FOREIGN KEY (PrdID) REFERENCES Products(PrdID)
);

CREATE TABLE Purchases (
  PurchaseID INT PRIMARY KEY IDENTITY(1,1),
  CompID INT,
  SupplierID INT,
  TotalAmount DECIMAL(18, 2) NOT NULL,
  VoucherNo INT,
  PurchaseDate DATETIME DEFAULT GETDATE(),
  CONSTRAINT FK_Purchases_Company FOREIGN KEY (CompID) REFERENCES Company(CompID) ON DELETE CASCADE,
  CONSTRAINT FK_Purchases_Supplier FOREIGN KEY (SupplierID) REFERENCES Accounts(AcctID)
);


CREATE TABLE PurchaseDetails (
  PurchaseDetailID INT PRIMARY KEY IDENTITY(1,1),
  PurchaseID INT,
  PrdID INT,
  Quantity INT NOT NULL,
  PurchasePrice DECIMAL(18, 2) NOT NULL,
  CONSTRAINT FK_PurchaseDetails_Purchase FOREIGN KEY (PurchaseID) REFERENCES Purchases(PurchaseID) ON DELETE CASCADE,
  CONSTRAINT FK_PurchaseDetails_Product FOREIGN KEY (PrdID) REFERENCES Products(PrdID)
);

CREATE TABLE Inventory(
	InventoryID int PRIMARY KEY IDENTITY(1, 1),
	VoucherNo int NOT NULL,
	VoucherType NVARCHAR(100) NOT NULL,
	PrdID int DEFAULT 0,
	QtyIn int DEFAULT 0,
	QtyOut int,
	AcctID int,
	UnitRate Decimal(18, 2),
	Discount Decimal(18, 2),
	TotalAmount Decimal(18, 2),
	CompID int,
	EntryDate DATETIME DEFAULT GETDATE(),
	Constraint FK_Inventory_Products Foreign Key (PrdID) REFERENCES Products(PrdID),
	CONSTRAINT FK_Inventory_Accounts Foreign Key (AcctID) REFERENCES Accounts(AcctID),
	CONSTRAINT FK_Inventory_Company Foreign Key (CompID) REFERENCES Company(CompID)
);

CREATE TABLE AccountDetails(
	AccountDetailID int PRIMARY KEY IDENTITY(1,1),
	VoucherNo int,
	VoucherType NVARCHAR(100),
	AcctID int,
	Debit DECIMAL(18, 2) DEFAULT 0,
	Credit DECIMAL(18, 2) DEFAULT 0,
	CompID int,
	EntryDate DATETIME DEFAULT GETDATE(),
	CONSTRAINT FK_AccountDetails_Accounts Foreign Key (AcctID) REFERENCES Accounts(AcctID), 
	CONSTRAINT FK_AccountDetails_Company Foreign Key (CompID) REFERENCES Company(CompID)
);

CREATE TABLE Sales (
  SaleID INT PRIMARY KEY IDENTITY(1,1),
  CompID INT,
  CustomerID INT,
  TotalAmount DECIMAL(18, 2) NOT NULL,
  Discount DECIMAL(18, 2),
  VoucherNo int ,
  SaleDate DATETIME DEFAULT GETDATE(),
  CONSTRAINT FK_Sales_Company FOREIGN KEY (CompID) REFERENCES Company(CompID) ON DELETE CASCADE,
  CONSTRAINT FK_Sales_Customer FOREIGN KEY (CustomerID) REFERENCES Accounts(AcctID)
);


CREATE TABLE SaleDetails (
  SaleDetailID INT PRIMARY KEY IDENTITY(1,1),
  SaleID INT,
  PrdID INT,
  Quantity INT NOT NULL,
  SalePrice DECIMAL(18, 2) NOT NULL,
  CONSTRAINT FK_SaleDetails_Sale FOREIGN KEY (SaleID) REFERENCES Sales(SaleID) ON DELETE CASCADE,
  CONSTRAINT FK_SaleDetails_Product FOREIGN KEY (PrdID) REFERENCES Products(PrdID)
);

CREATE TABLE SupplierProducts (
  SupplierID INT,
  PrdID INT,
  PRIMARY KEY (SupplierID, PrdID),
  FOREIGN KEY (SupplierID) REFERENCES Accounts(AcctID),
  FOREIGN KEY (PrdID) REFERENCES Products(PrdID)
);


CREATE TABLE Payments (
  PaymentID INT PRIMARY KEY IDENTITY(1,1),
  CompID INT NOT NULL,
  AcctID INT NOT NULL,
  PaymentType NVARCHAR(20) CHECK (PaymentType IN ('Received', 'Paid')),
  Amount DECIMAL(18, 2) NOT NULL,
  CashBankAcctID INT NOT NULL,
  PaymentDate DATETIME DEFAULT GETDATE(),
  VoucherNo INT,
  Reference NVARCHAR(255),
  TransactionReference NVARCHAR(100),
  PurchaseID INT,
  SaleID INT,
  CONSTRAINT FK_Payments_Company FOREIGN KEY (CompID) REFERENCES Company(CompID) ON DELETE CASCADE,
  CONSTRAINT FK_Payments_Account FOREIGN KEY (AcctID) REFERENCES Accounts(AcctID),
  CONSTRAINT FK_Payments_CashBankAccount FOREIGN KEY (CashBankAcctID) REFERENCES Accounts(AcctID),
  CONSTRAINT FK_Payments_Purchase FOREIGN KEY (PurchaseID) REFERENCES Purchases(PurchaseID),
  CONSTRAINT FK_Payments_Sale FOREIGN KEY (SaleID) REFERENCES Sales(SaleID),
  CONSTRAINT CHK_Payment_Link CHECK (
    (PurchaseID IS NOT NULL AND SaleID IS NULL) OR
    (SaleID IS NOT NULL AND PurchaseID IS NULL) OR
    (PurchaseID IS NULL AND SaleID IS NULL)
  )
);

