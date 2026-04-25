import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SqlLesson from './models/SqlLesson.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codesprint50')
  .then(() => console.log('Connected to MongoDB for SQL Seeding'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Shared CompanyDB schema used across most lessons (employees, departments, products, customers, orders)
const companyDbSetup = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT
);
INSERT INTO departments VALUES (1, 'Engineering', 'Bangalore');
INSERT INTO departments VALUES (2, 'Sales', 'Mumbai');
INSERT INTO departments VALUES (3, 'HR', 'Bangalore');
INSERT INTO departments VALUES (4, 'Marketing', 'Delhi');
INSERT INTO departments VALUES (5, 'Finance', 'Mumbai');

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER,
  salary INTEGER,
  hire_date TEXT,
  manager_id INTEGER
);
INSERT INTO employees VALUES (1, 'Aarav Sharma', 1, 85000, '2020-03-15', NULL);
INSERT INTO employees VALUES (2, 'Diya Patel', 1, 62000, '2021-06-01', 1);
INSERT INTO employees VALUES (3, 'Rohan Kumar', 2, 55000, '2019-11-20', NULL);
INSERT INTO employees VALUES (4, 'Isha Reddy', 2, 48000, '2022-01-10', 3);
INSERT INTO employees VALUES (5, 'Kabir Singh', 3, 52000, '2020-08-05', NULL);
INSERT INTO employees VALUES (6, 'Ananya Iyer', 1, 71000, '2021-09-12', 1);
INSERT INTO employees VALUES (7, 'Vivaan Gupta', 4, 44000, '2023-02-18', NULL);
INSERT INTO employees VALUES (8, 'Saanvi Nair', 5, 95000, '2018-07-22', NULL);
INSERT INTO employees VALUES (9, 'Arjun Rao', 2, 40000, '2023-05-30', 3);
INSERT INTO employees VALUES (10, 'Myra Shah', 1, 58000, '2022-11-11', 1);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  country TEXT,
  signup_date TEXT
);
INSERT INTO customers VALUES (1, 'Ravi Menon', 'Bangalore', 'India', '2022-01-15');
INSERT INTO customers VALUES (2, 'Priya Joshi', 'Mumbai', 'India', '2022-03-22');
INSERT INTO customers VALUES (3, 'John Smith', 'London', 'UK', '2023-01-08');
INSERT INTO customers VALUES (4, 'Fatima Khan', 'Dubai', 'UAE', '2023-06-14');
INSERT INTO customers VALUES (5, 'Neha Verma', 'Delhi', 'India', '2021-11-30');
INSERT INTO customers VALUES (6, 'Li Wei', 'Shanghai', 'China', '2023-08-19');

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price INTEGER,
  stock INTEGER
);
INSERT INTO products VALUES (1, 'Laptop Pro', 'Electronics', 75000, 20);
INSERT INTO products VALUES (2, 'Wireless Mouse', 'Electronics', 1200, 150);
INSERT INTO products VALUES (3, 'Cotton T-Shirt', 'Clothing', 800, 300);
INSERT INTO products VALUES (4, 'Leather Wallet', 'Accessories', 2500, 80);
INSERT INTO products VALUES (5, 'Running Shoes', 'Footwear', 4500, 60);
INSERT INTO products VALUES (6, 'Smart Watch', 'Electronics', 15000, 45);
INSERT INTO products VALUES (7, 'Denim Jeans', 'Clothing', 2200, 120);
INSERT INTO products VALUES (8, 'Backpack', 'Accessories', 1800, 0);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  product_id INTEGER,
  quantity INTEGER,
  order_date TEXT,
  total_amount INTEGER
);
INSERT INTO orders VALUES (1, 1, 1, 1, '2024-01-10', 75000);
INSERT INTO orders VALUES (2, 2, 3, 3, '2024-01-15', 2400);
INSERT INTO orders VALUES (3, 1, 2, 2, '2024-02-20', 2400);
INSERT INTO orders VALUES (4, 3, 6, 1, '2024-03-05', 15000);
INSERT INTO orders VALUES (5, 4, 5, 1, '2024-03-18', 4500);
INSERT INTO orders VALUES (6, 2, 7, 2, '2024-04-02', 4400);
INSERT INTO orders VALUES (7, 5, 1, 1, '2024-04-22', 75000);
INSERT INTO orders VALUES (8, 1, 4, 1, '2024-05-11', 2500);
INSERT INTO orders VALUES (9, 6, 6, 2, '2024-05-28', 30000);
INSERT INTO orders VALUES (10, 3, 3, 5, '2024-06-04', 4000);
INSERT INTO orders VALUES (11, 2, 2, 1, '2024-06-14', 1200);
INSERT INTO orders VALUES (12, 4, 7, 1, '2024-07-02', 2200);
`;

const companySchemaDesc = `**departments**(id, name, location)
**employees**(id, name, department_id, salary, hire_date, manager_id)
**customers**(id, name, city, country, signup_date)
**products**(id, name, category, price, stock)
**orders**(id, customer_id, product_id, quantity, order_date, total_amount)`;

const lessons = [
  // ============ LESSON 1 ============
  {
    lessonNumber: 1,
    title: 'SQL Basics: SELECT & FROM',
    description: 'Retrieve data from tables using the SELECT statement — the foundation of every SQL query.',
    difficulty: 'Beginner',
    conceptExplanation: `SQL (Structured Query Language) is the standard language for managing relational databases.

The most common operation is **reading data** using \`SELECT\`. The basic shape is:

\`\`\`sql
SELECT column1, column2 FROM table_name;
\`\`\`

- \`SELECT\` chooses which columns to return
- \`FROM\` names the table to read from
- \`*\` means "all columns"

SQL keywords are case-insensitive (\`SELECT\` = \`select\`), but writing them UPPERCASE is a convention that makes queries easier to read.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'What does the SELECT statement do in SQL?',
        options: [
          { text: 'Deletes rows from a table', isCorrect: false },
          { text: 'Retrieves data from one or more tables', isCorrect: true },
          { text: 'Creates a new table', isCorrect: false },
          { text: 'Modifies the structure of a table', isCorrect: false }
        ],
        explanation: 'SELECT is a DQL (Data Query Language) command used to read data. It does not modify data or structure.'
      },
      {
        question: 'Which symbol is used to select ALL columns from a table?',
        options: [
          { text: '#', isCorrect: false },
          { text: '@', isCorrect: false },
          { text: '*', isCorrect: true },
          { text: '%', isCorrect: false }
        ],
        explanation: 'The asterisk (*) is a wildcard that means "every column". In production code, prefer listing columns explicitly for clarity.'
      },
      {
        question: 'SQL keywords are:',
        options: [
          { text: 'Case-sensitive — SELECT and select are different', isCorrect: false },
          { text: 'Case-insensitive — SELECT and select are the same', isCorrect: true },
          { text: 'Only valid in uppercase', isCorrect: false },
          { text: 'Only valid in lowercase', isCorrect: false }
        ],
        explanation: 'SQL keywords are case-insensitive by standard. However, table/column names can be case-sensitive depending on the database.'
      }
    ],
    queryProblems: [
      {
        title: 'List all employees',
        prompt: 'Write a query that returns all columns and all rows from the employees table.',
        starterQuery: 'SELECT ',
        solutionQuery: 'SELECT * FROM employees;',
        hint: 'Use * to select all columns.',
        explanation: 'SELECT * FROM employees returns every column for every row.',
        difficulty: 'Easy'
      },
      {
        title: 'Names and salaries only',
        prompt: 'Return only the name and salary of every employee.',
        starterQuery: '',
        solutionQuery: 'SELECT name, salary FROM employees;',
        hint: 'Separate column names with commas.',
        explanation: 'Listing specific columns reduces network transfer and makes intent clear.',
        difficulty: 'Easy'
      },
      {
        title: 'All product names',
        prompt: 'List the name column from the products table.',
        starterQuery: '',
        solutionQuery: 'SELECT name FROM products;',
        hint: 'Single column — no comma needed.',
        difficulty: 'Easy'
      }
    ]
  },

  // ============ LESSON 2 ============
  {
    lessonNumber: 2,
    title: 'Filtering with WHERE',
    description: 'Narrow down your results using WHERE clauses, comparison operators, and logical AND/OR/NOT.',
    difficulty: 'Beginner',
    conceptExplanation: `The \`WHERE\` clause filters rows before they are returned.

\`\`\`sql
SELECT * FROM employees WHERE salary > 50000;
\`\`\`

**Comparison operators:** \`=\`, \`!=\` or \`<>\`, \`<\`, \`>\`, \`<=\`, \`>=\`

**Logical operators:**
- \`AND\` — both conditions must be true
- \`OR\` — at least one condition is true
- \`NOT\` — inverts the condition

**String comparison:** use single quotes: \`WHERE city = 'Mumbai'\``,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'Which clause is used to filter rows in a SELECT query?',
        options: [
          { text: 'FILTER', isCorrect: false },
          { text: 'WHERE', isCorrect: true },
          { text: 'HAVING', isCorrect: false },
          { text: 'LIMIT', isCorrect: false }
        ],
        explanation: 'WHERE filters rows before aggregation. HAVING filters after aggregation (we cover that later).'
      },
      {
        question: 'Which operator means "not equal to" in standard SQL?',
        options: [
          { text: '!==', isCorrect: false },
          { text: '<>', isCorrect: true },
          { text: '~=', isCorrect: false },
          { text: 'NOT=', isCorrect: false }
        ],
        explanation: 'Standard SQL uses <>. Many databases also accept != but <> is portable.'
      },
      {
        question: 'What is the correct way to compare a string in SQL?',
        options: [
          { text: 'WHERE name = "Aarav"', isCorrect: false },
          { text: "WHERE name = 'Aarav'", isCorrect: true },
          { text: 'WHERE name == Aarav', isCorrect: false },
          { text: 'WHERE name is Aarav', isCorrect: false }
        ],
        explanation: "Standard SQL uses single quotes for string literals. Double quotes are reserved for identifiers in many databases."
      }
    ],
    queryProblems: [
      {
        title: 'High earners',
        prompt: 'Find all employees with a salary greater than 60000. Return all columns.',
        starterQuery: 'SELECT * FROM employees WHERE ',
        solutionQuery: 'SELECT * FROM employees WHERE salary > 60000;',
        hint: 'Use the > operator.',
        difficulty: 'Easy'
      },
      {
        title: 'Specific department',
        prompt: 'Return the name and salary of employees in department 1 (Engineering).',
        starterQuery: '',
        solutionQuery: 'SELECT name, salary FROM employees WHERE department_id = 1;',
        hint: 'Use = for equality.',
        difficulty: 'Easy'
      },
      {
        title: 'Mid-range salaries',
        prompt: 'List employees earning between 50000 and 70000 (inclusive). Return name and salary.',
        starterQuery: '',
        solutionQuery: 'SELECT name, salary FROM employees WHERE salary >= 50000 AND salary <= 70000;',
        hint: 'Combine two conditions with AND.',
        explanation: 'BETWEEN ... AND ... is a cleaner alternative — we cover it in the next lesson.',
        difficulty: 'Easy'
      },
      {
        title: 'Indian customers in big cities',
        prompt: 'Find customers from India who are either in Mumbai or Bangalore. Return all columns.',
        starterQuery: '',
        solutionQuery: "SELECT * FROM customers WHERE country = 'India' AND (city = 'Mumbai' OR city = 'Bangalore');",
        hint: 'Use AND and OR. Parentheses matter.',
        difficulty: 'Medium'
      }
    ]
  },

  // ============ LESSON 3 ============
  {
    lessonNumber: 3,
    title: 'Sorting & Limiting Results',
    description: 'Control result order with ORDER BY, and cap row counts with LIMIT.',
    difficulty: 'Beginner',
    conceptExplanation: `**ORDER BY** sorts the result set:

\`\`\`sql
SELECT * FROM employees ORDER BY salary DESC;
\`\`\`

- \`ASC\` = ascending (default, low to high)
- \`DESC\` = descending (high to low)

You can sort by multiple columns — ties are broken by the next column:

\`\`\`sql
ORDER BY department_id ASC, salary DESC;
\`\`\`

**LIMIT** restricts how many rows are returned:

\`\`\`sql
SELECT * FROM employees ORDER BY salary DESC LIMIT 3;
\`\`\`

This gives the top 3 earners. Without ORDER BY, LIMIT returns an arbitrary subset — always combine them when order matters.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'What is the default sort order in SQL when ORDER BY is used without ASC/DESC?',
        options: [
          { text: 'Descending', isCorrect: false },
          { text: 'Ascending', isCorrect: true },
          { text: 'Random', isCorrect: false },
          { text: 'Insertion order', isCorrect: false }
        ],
        explanation: 'ORDER BY sorts ascending by default. Use DESC explicitly when you want high-to-low.'
      },
      {
        question: 'If you use LIMIT without ORDER BY, which rows are returned?',
        options: [
          { text: 'The first inserted rows, always', isCorrect: false },
          { text: 'The rows with the smallest primary key', isCorrect: false },
          { text: 'An arbitrary subset — order is not guaranteed', isCorrect: true },
          { text: 'An error is raised', isCorrect: false }
        ],
        explanation: 'Without ORDER BY, the database is free to return rows in any order. Always pair LIMIT with ORDER BY for deterministic results.'
      }
    ],
    queryProblems: [
      {
        title: 'Highest paid employees',
        prompt: 'List all employees sorted from highest to lowest salary. Return name and salary.',
        starterQuery: '',
        solutionQuery: 'SELECT name, salary FROM employees ORDER BY salary DESC;',
        hint: 'Use ORDER BY ... DESC.',
        orderMatters: true,
        difficulty: 'Easy'
      },
      {
        title: 'Top 3 earners',
        prompt: 'Return the name and salary of the 3 highest-paid employees.',
        starterQuery: '',
        solutionQuery: 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;',
        hint: 'Sort, then LIMIT.',
        orderMatters: true,
        difficulty: 'Easy'
      },
      {
        title: 'Alphabetical products',
        prompt: 'List product names in alphabetical order.',
        starterQuery: '',
        solutionQuery: 'SELECT name FROM products ORDER BY name ASC;',
        orderMatters: true,
        difficulty: 'Easy'
      },
      {
        title: 'Department then salary',
        prompt: 'List employee name, department_id, and salary. Sort by department_id ascending; within each department, sort by salary descending.',
        starterQuery: '',
        solutionQuery: 'SELECT name, department_id, salary FROM employees ORDER BY department_id ASC, salary DESC;',
        hint: 'Separate sort keys with a comma.',
        orderMatters: true,
        difficulty: 'Medium'
      }
    ]
  },

  // ============ LESSON 4 ============
  {
    lessonNumber: 4,
    title: 'DISTINCT, IN, BETWEEN, LIKE',
    description: 'Eliminate duplicates and use powerful filtering operators.',
    difficulty: 'Beginner',
    conceptExplanation: `**DISTINCT** removes duplicate rows from the result:

\`\`\`sql
SELECT DISTINCT country FROM customers;
\`\`\`

**IN** matches any value in a list:

\`\`\`sql
WHERE city IN ('Mumbai', 'Bangalore', 'Delhi')
\`\`\`

**BETWEEN** is inclusive on both ends:

\`\`\`sql
WHERE salary BETWEEN 50000 AND 70000
-- same as: salary >= 50000 AND salary <= 70000
\`\`\`

**LIKE** does pattern matching:
- \`%\` matches zero or more characters
- \`_\` matches exactly one character

\`\`\`sql
WHERE name LIKE 'A%'      -- starts with A
WHERE name LIKE '%ar%'    -- contains 'ar'
WHERE name LIKE '_iya'    -- any one char + 'iya'
\`\`\`

**IS NULL / IS NOT NULL** — you cannot use \`= NULL\`. NULL is "unknown", not a value.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'Why does "WHERE manager_id = NULL" return no rows?',
        options: [
          { text: 'NULL equals NULL is always false — use IS NULL', isCorrect: true },
          { text: 'Syntax error, it should crash', isCorrect: false },
          { text: 'NULL is interpreted as 0', isCorrect: false },
          { text: 'It only works in uppercase: = Null', isCorrect: false }
        ],
        explanation: 'In SQL, NULL represents unknown, so any comparison with NULL using = returns NULL (neither true nor false). Use IS NULL or IS NOT NULL.'
      },
      {
        question: 'What does the % wildcard match in a LIKE pattern?',
        options: [
          { text: 'Exactly one character', isCorrect: false },
          { text: 'Zero or more characters', isCorrect: true },
          { text: 'A digit only', isCorrect: false },
          { text: 'A whitespace character', isCorrect: false }
        ],
        explanation: '% matches any sequence (including empty). _ matches exactly one character.'
      },
      {
        question: 'BETWEEN 10 AND 20 is equivalent to:',
        options: [
          { text: '> 10 AND < 20', isCorrect: false },
          { text: '>= 10 AND <= 20', isCorrect: true },
          { text: '>= 10 AND < 20', isCorrect: false },
          { text: '> 10 AND <= 20', isCorrect: false }
        ],
        explanation: 'BETWEEN is inclusive on both bounds in standard SQL.'
      }
    ],
    queryProblems: [
      {
        title: 'Unique countries',
        prompt: 'Return a list of distinct countries customers come from.',
        starterQuery: '',
        solutionQuery: 'SELECT DISTINCT country FROM customers;',
        hint: 'Use DISTINCT.',
        difficulty: 'Easy'
      },
      {
        title: 'Products in specific categories',
        prompt: 'Return all products whose category is either Electronics or Footwear.',
        starterQuery: '',
        solutionQuery: "SELECT * FROM products WHERE category IN ('Electronics', 'Footwear');",
        hint: 'Use IN instead of multiple OR conditions.',
        difficulty: 'Easy'
      },
      {
        title: 'Names starting with A',
        prompt: 'Return employees whose name starts with the letter A. Return name and salary.',
        starterQuery: '',
        solutionQuery: "SELECT name, salary FROM employees WHERE name LIKE 'A%';",
        hint: "LIKE 'A%'",
        difficulty: 'Easy'
      },
      {
        title: 'Top-level managers',
        prompt: 'Find all employees who have no manager (manager_id is NULL). Return name.',
        starterQuery: '',
        solutionQuery: 'SELECT name FROM employees WHERE manager_id IS NULL;',
        hint: 'IS NULL, not = NULL.',
        difficulty: 'Medium'
      }
    ]
  },

  // ============ LESSON 5 ============
  {
    lessonNumber: 5,
    title: 'Aggregate Functions',
    description: 'Summarize data with COUNT, SUM, AVG, MIN, and MAX.',
    difficulty: 'Intermediate',
    conceptExplanation: `Aggregate functions collapse multiple rows into a single value:

- \`COUNT(*)\` — count all rows
- \`COUNT(column)\` — count non-NULL values in that column
- \`COUNT(DISTINCT column)\` — count unique non-NULL values
- \`SUM(column)\` — total
- \`AVG(column)\` — average
- \`MIN(column)\`, \`MAX(column)\` — extremes

\`\`\`sql
SELECT COUNT(*) AS total_employees, AVG(salary) AS avg_salary
FROM employees;
\`\`\`

**AS** gives a column an alias — the returned column will be named \`total_employees\` instead of \`COUNT(*)\`.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'What is the difference between COUNT(*) and COUNT(column_name)?',
        options: [
          { text: 'No difference — they are aliases', isCorrect: false },
          { text: 'COUNT(*) counts all rows; COUNT(column) ignores NULLs in that column', isCorrect: true },
          { text: 'COUNT(*) is faster but less accurate', isCorrect: false },
          { text: 'COUNT(column) requires an index', isCorrect: false }
        ],
        explanation: 'COUNT(*) counts every row. COUNT(column) only counts rows where that column is NOT NULL.'
      },
      {
        question: 'Which keyword renames a column in the result?',
        options: [
          { text: 'RENAME', isCorrect: false },
          { text: 'AS', isCorrect: true },
          { text: 'ALIAS', isCorrect: false },
          { text: 'LABEL', isCorrect: false }
        ],
        explanation: 'AS introduces a column or table alias. In many databases AS is optional, but using it improves readability.'
      }
    ],
    queryProblems: [
      {
        title: 'Total employees',
        prompt: 'How many employees are there? Return a single column named total.',
        starterQuery: '',
        solutionQuery: 'SELECT COUNT(*) AS total FROM employees;',
        hint: 'COUNT(*) AS total',
        difficulty: 'Easy'
      },
      {
        title: 'Salary stats',
        prompt: 'Return the average, minimum, and maximum salary across all employees. Alias them as avg_salary, min_salary, max_salary.',
        starterQuery: '',
        solutionQuery: 'SELECT AVG(salary) AS avg_salary, MIN(salary) AS min_salary, MAX(salary) AS max_salary FROM employees;',
        difficulty: 'Easy'
      },
      {
        title: 'Revenue from orders',
        prompt: 'What is the total revenue (sum of total_amount) across all orders? Alias as total_revenue.',
        starterQuery: '',
        solutionQuery: 'SELECT SUM(total_amount) AS total_revenue FROM orders;',
        difficulty: 'Easy'
      },
      {
        title: 'Unique customer count',
        prompt: 'How many distinct customers have placed at least one order? Alias as unique_customers.',
        starterQuery: '',
        solutionQuery: 'SELECT COUNT(DISTINCT customer_id) AS unique_customers FROM orders;',
        hint: 'COUNT(DISTINCT ...)',
        difficulty: 'Medium'
      }
    ]
  },

  // ============ LESSON 6 ============
  {
    lessonNumber: 6,
    title: 'GROUP BY & HAVING',
    description: 'Group rows into buckets and aggregate within each group. Filter aggregated results with HAVING.',
    difficulty: 'Intermediate',
    conceptExplanation: `**GROUP BY** collapses rows with the same value into one row, per group:

\`\`\`sql
SELECT department_id, COUNT(*) AS headcount
FROM employees
GROUP BY department_id;
\`\`\`

**Rule:** every column in SELECT must either be in GROUP BY or wrapped in an aggregate function.

**HAVING** filters groups AFTER aggregation. \`WHERE\` cannot reference aggregates — \`HAVING\` can:

\`\`\`sql
SELECT department_id, AVG(salary) AS avg_sal
FROM employees
GROUP BY department_id
HAVING AVG(salary) > 60000;
\`\`\`

**Execution order (conceptual):** FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'What is the key difference between WHERE and HAVING?',
        options: [
          { text: 'WHERE is faster than HAVING', isCorrect: false },
          { text: 'WHERE filters rows before aggregation; HAVING filters groups after aggregation', isCorrect: true },
          { text: 'HAVING only works with COUNT(*)', isCorrect: false },
          { text: 'They are interchangeable', isCorrect: false }
        ],
        explanation: 'WHERE cannot reference aggregate functions because aggregates do not exist yet at that stage. HAVING runs after GROUP BY and can filter on aggregates.'
      },
      {
        question: 'If a SELECT has a non-aggregated column that is not in GROUP BY, what happens?',
        options: [
          { text: 'The query returns NULL for that column', isCorrect: false },
          { text: 'It is a syntax error in standard SQL', isCorrect: true },
          { text: 'It returns a random value', isCorrect: false },
          { text: 'It is allowed and returns the first value', isCorrect: false }
        ],
        explanation: 'Standard SQL requires every non-aggregated SELECT column to appear in GROUP BY. Some databases (MySQL with loose mode) allow it but return unpredictable values.'
      }
    ],
    queryProblems: [
      {
        title: 'Headcount per department',
        prompt: 'For each department_id, return the number of employees. Columns: department_id, headcount.',
        starterQuery: '',
        solutionQuery: 'SELECT department_id, COUNT(*) AS headcount FROM employees GROUP BY department_id;',
        hint: 'GROUP BY department_id, COUNT(*).',
        difficulty: 'Easy'
      },
      {
        title: 'Average salary per department',
        prompt: 'Return department_id and average salary (aliased avg_salary) for each department.',
        starterQuery: '',
        solutionQuery: 'SELECT department_id, AVG(salary) AS avg_salary FROM employees GROUP BY department_id;',
        difficulty: 'Easy'
      },
      {
        title: 'Big-spender customers',
        prompt: 'Return customer_id and total spent (SUM of total_amount, alias total_spent) for customers whose total spend exceeds 10000.',
        starterQuery: '',
        solutionQuery: 'SELECT customer_id, SUM(total_amount) AS total_spent FROM orders GROUP BY customer_id HAVING SUM(total_amount) > 10000;',
        hint: 'HAVING runs after GROUP BY.',
        difficulty: 'Medium'
      },
      {
        title: 'Products per category',
        prompt: 'For each category, count the products and the total stock. Columns: category, product_count, total_stock.',
        starterQuery: '',
        solutionQuery: 'SELECT category, COUNT(*) AS product_count, SUM(stock) AS total_stock FROM products GROUP BY category;',
        difficulty: 'Medium'
      }
    ]
  },

  // ============ LESSON 7 ============
  {
    lessonNumber: 7,
    title: 'INNER JOIN',
    description: 'Combine rows from two tables based on a matching key.',
    difficulty: 'Intermediate',
    conceptExplanation: `An **INNER JOIN** returns only rows that match in both tables:

\`\`\`sql
SELECT e.name, d.name AS department
FROM employees e
INNER JOIN departments d ON e.department_id = d.id;
\`\`\`

- \`e\` and \`d\` are table aliases (short names)
- \`ON\` specifies the join condition
- Employees with a NULL \`department_id\` or a \`department_id\` with no match in \`departments\` are **excluded**

You can JOIN more than two tables:

\`\`\`sql
SELECT o.id, c.name AS customer, p.name AS product
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id;
\`\`\`

\`INNER\` is the default — \`JOIN\` alone means \`INNER JOIN\`.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'What does an INNER JOIN return?',
        options: [
          { text: 'All rows from both tables', isCorrect: false },
          { text: 'Only rows where the join condition is satisfied in both tables', isCorrect: true },
          { text: 'All rows from the left table', isCorrect: false },
          { text: 'Only rows from the smaller table', isCorrect: false }
        ],
        explanation: 'INNER JOIN returns the intersection — rows that match the ON condition on both sides.'
      },
      {
        question: 'If you omit the ON clause in an INNER JOIN, what happens?',
        options: [
          { text: 'Syntax error in most databases', isCorrect: true },
          { text: 'It becomes a LEFT JOIN', isCorrect: false },
          { text: 'It joins on the primary keys automatically', isCorrect: false },
          { text: 'It returns no rows', isCorrect: false }
        ],
        explanation: 'Most databases require ON for a JOIN. Without it you get a syntax error. A CROSS JOIN (Cartesian product) does not need ON.'
      }
    ],
    queryProblems: [
      {
        title: 'Employees with department names',
        prompt: 'Return each employee name alongside their department name. Columns: employee_name, department_name. Use aliases.',
        starterQuery: '',
        solutionQuery: 'SELECT e.name AS employee_name, d.name AS department_name FROM employees e INNER JOIN departments d ON e.department_id = d.id;',
        hint: 'Alias the tables (e, d) to avoid ambiguity on the "name" column.',
        difficulty: 'Medium'
      },
      {
        title: 'Orders with customer names',
        prompt: 'Return order id, customer name, and order date for every order. Columns: order_id, customer_name, order_date.',
        starterQuery: '',
        solutionQuery: 'SELECT o.id AS order_id, c.name AS customer_name, o.order_date FROM orders o JOIN customers c ON o.customer_id = c.id;',
        difficulty: 'Medium'
      },
      {
        title: 'Three-way join',
        prompt: 'For each order, show the order id, customer name, and product name. Columns: order_id, customer_name, product_name.',
        starterQuery: '',
        solutionQuery: 'SELECT o.id AS order_id, c.name AS customer_name, p.name AS product_name FROM orders o JOIN customers c ON o.customer_id = c.id JOIN products p ON o.product_id = p.id;',
        hint: 'Chain two JOINs.',
        difficulty: 'Hard'
      }
    ]
  },

  // ============ LESSON 8 ============
  {
    lessonNumber: 8,
    title: 'LEFT, RIGHT & OUTER JOIN',
    description: 'Keep unmatched rows from one or both sides of a join.',
    difficulty: 'Intermediate',
    conceptExplanation: `**LEFT JOIN** (aka LEFT OUTER JOIN) keeps all rows from the left table, even without a match. Missing right-side columns become NULL:

\`\`\`sql
SELECT d.name, e.name
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id;
\`\`\`

Every department is listed, even those with no employees (e.name will be NULL).

**RIGHT JOIN** is the mirror — keep all rows from the right table.

**FULL OUTER JOIN** keeps all rows from both sides. SQLite does not support FULL OUTER natively; simulate it with \`LEFT JOIN ... UNION ... LEFT JOIN (swapped)\`.

**Finding "not-matched" rows** — a classic pattern:

\`\`\`sql
SELECT d.name
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id
WHERE e.id IS NULL;
\`\`\`

This finds departments with no employees.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'In a LEFT JOIN, if a row from the left table has no match on the right:',
        options: [
          { text: 'It is excluded from the result', isCorrect: false },
          { text: 'It is included with NULLs for the right-side columns', isCorrect: true },
          { text: 'An error is raised', isCorrect: false },
          { text: 'It is duplicated once per right table row', isCorrect: false }
        ],
        explanation: 'LEFT JOIN preserves all left rows; right-side columns are NULL when there is no match.'
      },
      {
        question: 'Which pattern finds rows from table A that have NO matching row in table B?',
        options: [
          { text: 'A INNER JOIN B WHERE B.id IS NULL', isCorrect: false },
          { text: 'A LEFT JOIN B ON ... WHERE B.id IS NULL', isCorrect: true },
          { text: 'A RIGHT JOIN B WHERE A.id IS NULL', isCorrect: false },
          { text: 'A FULL JOIN B WHERE A.id = B.id', isCorrect: false }
        ],
        explanation: 'LEFT JOIN keeps unmatched A rows; filtering WHERE B.id IS NULL isolates those with no B match. This is the "anti-join" pattern.'
      }
    ],
    queryProblems: [
      {
        title: 'All departments with employee counts',
        prompt: 'For every department (even those with zero employees), return the department name and the count of employees. Columns: department_name, employee_count.',
        starterQuery: '',
        solutionQuery: 'SELECT d.name AS department_name, COUNT(e.id) AS employee_count FROM departments d LEFT JOIN employees e ON e.department_id = d.id GROUP BY d.id, d.name;',
        hint: 'LEFT JOIN keeps empty departments. Use COUNT(e.id), not COUNT(*), so empty groups count as 0.',
        difficulty: 'Hard'
      },
      {
        title: 'Customers who never ordered',
        prompt: 'Return the name of every customer who has not placed a single order.',
        starterQuery: '',
        solutionQuery: 'SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;',
        hint: 'LEFT JOIN then filter where the right side is NULL.',
        difficulty: 'Hard'
      }
    ]
  },

  // ============ LESSON 9 ============
  {
    lessonNumber: 9,
    title: 'Subqueries',
    description: 'Nest queries inside queries — in SELECT, FROM, WHERE, and with IN/EXISTS.',
    difficulty: 'Intermediate',
    conceptExplanation: `A **subquery** is a query inside another query. Three common shapes:

**1. Scalar subquery** — returns one value:
\`\`\`sql
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
\`\`\`

**2. IN subquery** — returns a list:
\`\`\`sql
SELECT name FROM employees
WHERE department_id IN (SELECT id FROM departments WHERE location = 'Bangalore');
\`\`\`

**3. Derived table (in FROM)** — treat a subquery as a virtual table:
\`\`\`sql
SELECT dept, avg_sal
FROM (SELECT department_id AS dept, AVG(salary) AS avg_sal
      FROM employees GROUP BY department_id) t
WHERE avg_sal > 60000;
\`\`\`

**EXISTS** — checks for existence, faster than IN for large sets:
\`\`\`sql
SELECT c.name FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
\`\`\``,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'A scalar subquery must return:',
        options: [
          { text: 'Multiple rows', isCorrect: false },
          { text: 'Exactly one row and one column', isCorrect: true },
          { text: 'At least one row', isCorrect: false },
          { text: 'A whole table', isCorrect: false }
        ],
        explanation: 'Scalar subqueries return a single value. If they return multiple rows in a context expecting a scalar, you get a runtime error.'
      },
      {
        question: 'Which is generally better for checking "does a matching row exist"?',
        options: [
          { text: 'COUNT(*) > 0', isCorrect: false },
          { text: 'EXISTS', isCorrect: true },
          { text: 'DISTINCT', isCorrect: false },
          { text: 'GROUP BY', isCorrect: false }
        ],
        explanation: 'EXISTS short-circuits on the first match, while COUNT(*) has to count everything. EXISTS is almost always faster for existence checks.'
      }
    ],
    queryProblems: [
      {
        title: 'Above-average earners',
        prompt: 'Return the name and salary of employees whose salary is strictly greater than the overall average salary.',
        starterQuery: '',
        solutionQuery: 'SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);',
        hint: 'Use a scalar subquery in WHERE.',
        difficulty: 'Medium'
      },
      {
        title: 'Employees in Bangalore departments',
        prompt: 'Return the names of employees whose department is located in Bangalore.',
        starterQuery: '',
        solutionQuery: "SELECT name FROM employees WHERE department_id IN (SELECT id FROM departments WHERE location = 'Bangalore');",
        hint: 'Use IN with a subquery.',
        difficulty: 'Medium'
      },
      {
        title: 'Customers who ordered something',
        prompt: 'Return the names of customers who have placed at least one order. Use EXISTS.',
        starterQuery: '',
        solutionQuery: 'SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);',
        difficulty: 'Hard'
      }
    ]
  },

  // ============ LESSON 10 ============
  {
    lessonNumber: 10,
    title: 'Correlated Subqueries & CTEs',
    description: 'Subqueries that reference the outer query, and Common Table Expressions (WITH clause).',
    difficulty: 'Advanced',
    conceptExplanation: `A **correlated subquery** references a column from the outer query — it is re-evaluated for each outer row:

\`\`\`sql
SELECT e.name, e.salary
FROM employees e
WHERE e.salary > (
  SELECT AVG(salary) FROM employees
  WHERE department_id = e.department_id  -- references outer 'e'
);
\`\`\`

This finds employees who earn more than their department's average.

**CTEs (Common Table Expressions)** — cleaner than nested subqueries:

\`\`\`sql
WITH dept_avg AS (
  SELECT department_id, AVG(salary) AS avg_sal
  FROM employees GROUP BY department_id
)
SELECT e.name, e.salary, d.avg_sal
FROM employees e
JOIN dept_avg d ON e.department_id = d.department_id
WHERE e.salary > d.avg_sal;
\`\`\`

CTEs make queries readable and can be referenced multiple times.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'What makes a subquery "correlated"?',
        options: [
          { text: 'It is in the FROM clause', isCorrect: false },
          { text: 'It references a column from the outer query', isCorrect: true },
          { text: 'It uses EXISTS', isCorrect: false },
          { text: 'It returns multiple rows', isCorrect: false }
        ],
        explanation: 'Correlated subqueries depend on the outer query for each row. Non-correlated subqueries can be evaluated once, independently.'
      },
      {
        question: 'What does a CTE (WITH clause) primarily help with?',
        options: [
          { text: 'Faster query execution always', isCorrect: false },
          { text: 'Readability and reusability within a single query', isCorrect: true },
          { text: 'Automatic indexing', isCorrect: false },
          { text: 'Replacing JOINs entirely', isCorrect: false }
        ],
        explanation: 'CTEs make complex queries easier to read and let you reference the same intermediate result multiple times. Performance impact varies by database.'
      }
    ],
    queryProblems: [
      {
        title: 'Above-department-average',
        prompt: 'Return name and salary of employees who earn more than the average salary of their own department.',
        starterQuery: '',
        solutionQuery: 'SELECT name, salary FROM employees e WHERE salary > (SELECT AVG(salary) FROM employees WHERE department_id = e.department_id);',
        hint: 'Correlated subquery — reference e.department_id inside.',
        difficulty: 'Hard'
      },
      {
        title: 'CTE — high-value customers',
        prompt: 'Using a CTE, list customers whose total spend exceeds 10000. Columns: name, total_spent.',
        starterQuery: 'WITH ',
        solutionQuery: 'WITH cust_totals AS (SELECT customer_id, SUM(total_amount) AS total_spent FROM orders GROUP BY customer_id) SELECT c.name, ct.total_spent FROM customers c JOIN cust_totals ct ON ct.customer_id = c.id WHERE ct.total_spent > 10000;',
        hint: 'Define the CTE, then JOIN it to customers.',
        difficulty: 'Hard'
      }
    ]
  },

  // ============ LESSON 11 ============
  {
    lessonNumber: 11,
    title: 'UNION, INTERSECT & EXCEPT',
    description: 'Combine results from multiple queries with set operators.',
    difficulty: 'Intermediate',
    conceptExplanation: `Set operators stack result sets on top of each other. **All participating queries must have the same number of columns with compatible types.**

**UNION** — combine and remove duplicates:
\`\`\`sql
SELECT city FROM customers
UNION
SELECT location FROM departments;
\`\`\`

**UNION ALL** — combine WITHOUT removing duplicates (faster, no dedup cost).

**INTERSECT** — only rows that appear in both.
**EXCEPT** (called MINUS in Oracle) — rows in the first query that are not in the second.

Use \`ORDER BY\` once, at the very end:
\`\`\`sql
SELECT ... UNION SELECT ... ORDER BY column1;
\`\`\``,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'What is the difference between UNION and UNION ALL?',
        options: [
          { text: 'UNION is faster than UNION ALL', isCorrect: false },
          { text: 'UNION removes duplicates; UNION ALL keeps them', isCorrect: true },
          { text: 'They are identical', isCorrect: false },
          { text: 'UNION ALL only works with two tables', isCorrect: false }
        ],
        explanation: 'UNION does a deduplication pass which has a cost. Prefer UNION ALL when you know duplicates cannot occur or you do not care.'
      },
      {
        question: 'For UNION to work, the participating queries must have:',
        options: [
          { text: 'The same table name', isCorrect: false },
          { text: 'The same number of columns with compatible types', isCorrect: true },
          { text: 'Exactly identical column names', isCorrect: false },
          { text: 'An INNER JOIN between them', isCorrect: false }
        ],
        explanation: 'Column count and type compatibility are required. Column names come from the first query.'
      }
    ],
    queryProblems: [
      {
        title: 'All locations (dedup)',
        prompt: 'Return a single column named place containing every distinct city (from customers) and location (from departments), combined.',
        starterQuery: '',
        solutionQuery: 'SELECT city AS place FROM customers UNION SELECT location AS place FROM departments;',
        hint: 'UNION auto-deduplicates.',
        difficulty: 'Medium'
      },
      {
        title: 'Cities in both tables',
        prompt: 'Return cities that appear in BOTH the customers.city list and the departments.location list.',
        starterQuery: '',
        solutionQuery: 'SELECT city FROM customers INTERSECT SELECT location FROM departments;',
        hint: 'INTERSECT.',
        difficulty: 'Medium'
      }
    ]
  },

  // ============ LESSON 12 ============
  {
    lessonNumber: 12,
    title: 'CASE Expressions',
    description: 'Conditional logic inside queries — the SQL equivalent of if/else.',
    difficulty: 'Intermediate',
    conceptExplanation: `**CASE WHEN** lets you branch inside SELECT, WHERE, ORDER BY, etc.

\`\`\`sql
SELECT name, salary,
  CASE
    WHEN salary >= 80000 THEN 'Senior'
    WHEN salary >= 50000 THEN 'Mid'
    ELSE 'Junior'
  END AS band
FROM employees;
\`\`\`

Use CASE inside aggregates for "pivot-like" summaries:

\`\`\`sql
SELECT
  SUM(CASE WHEN country = 'India' THEN 1 ELSE 0 END) AS india_count,
  SUM(CASE WHEN country <> 'India' THEN 1 ELSE 0 END) AS rest_count
FROM customers;
\`\`\`

This counts how many customers are in India vs. elsewhere in a single row.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'What keyword ends a CASE expression?',
        options: [
          { text: 'STOP', isCorrect: false },
          { text: 'END', isCorrect: true },
          { text: 'FINISH', isCorrect: false },
          { text: 'DONE', isCorrect: false }
        ],
        explanation: 'CASE ... END. You can optionally alias it with AS.'
      }
    ],
    queryProblems: [
      {
        title: 'Salary bands',
        prompt: 'Return name and a column band: "Senior" if salary >= 80000, "Mid" if >= 50000, else "Junior".',
        starterQuery: '',
        solutionQuery: "SELECT name, CASE WHEN salary >= 80000 THEN 'Senior' WHEN salary >= 50000 THEN 'Mid' ELSE 'Junior' END AS band FROM employees;",
        difficulty: 'Medium'
      },
      {
        title: 'In-stock vs out-of-stock',
        prompt: "For each product, return name and a column status: 'In Stock' if stock > 0 else 'Out of Stock'.",
        starterQuery: '',
        solutionQuery: "SELECT name, CASE WHEN stock > 0 THEN 'In Stock' ELSE 'Out of Stock' END AS status FROM products;",
        difficulty: 'Easy'
      }
    ]
  },

  // ============ LESSON 13 ============
  {
    lessonNumber: 13,
    title: 'String Functions',
    description: 'Manipulate text with UPPER, LOWER, LENGTH, SUBSTR, concatenation, and more.',
    difficulty: 'Intermediate',
    conceptExplanation: `Common string functions (SQLite syntax; most databases are similar):

- \`UPPER(s)\`, \`LOWER(s)\`
- \`LENGTH(s)\` — character length
- \`SUBSTR(s, start, length)\` — substring (1-indexed in SQLite)
- \`TRIM(s)\` — remove leading/trailing whitespace
- \`REPLACE(s, from, to)\`
- Concatenation: standard SQL uses \`||\` — \`first || ' ' || last\`. MySQL uses \`CONCAT()\`.

\`\`\`sql
SELECT UPPER(name) AS shout, LENGTH(name) AS len FROM employees;
\`\`\``,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'Which operator concatenates strings in standard SQL (and SQLite/Postgres)?',
        options: [
          { text: '+', isCorrect: false },
          { text: '||', isCorrect: true },
          { text: '&', isCorrect: false },
          { text: '.', isCorrect: false }
        ],
        explanation: 'Standard SQL uses ||. MySQL uses CONCAT() or requires special modes. SQL Server uses +.'
      }
    ],
    queryProblems: [
      {
        title: 'Names in uppercase',
        prompt: 'Return the employee name column in uppercase. Alias as upper_name.',
        starterQuery: '',
        solutionQuery: 'SELECT UPPER(name) AS upper_name FROM employees;',
        difficulty: 'Easy'
      },
      {
        title: 'Long product names',
        prompt: 'Return product name and its character length (alias name_length) for products whose name is longer than 10 characters.',
        starterQuery: '',
        solutionQuery: 'SELECT name, LENGTH(name) AS name_length FROM products WHERE LENGTH(name) > 10;',
        difficulty: 'Medium'
      }
    ]
  },

  // ============ LESSON 14 ============
  {
    lessonNumber: 14,
    title: 'Date & Time Functions',
    description: 'Extract parts of dates and compute ranges for time-based analysis.',
    difficulty: 'Intermediate',
    conceptExplanation: `SQLite stores dates as ISO strings (\`'2024-01-15'\`). Common operations:

- \`strftime('%Y', date_col)\` — extract year (returns string)
- \`strftime('%m', date_col)\` — month
- \`date('now')\` — today
- \`date(date_col, '+7 days')\` — add 7 days
- \`julianday(a) - julianday(b)\` — difference in days

\`\`\`sql
SELECT name, strftime('%Y', hire_date) AS hire_year FROM employees;
\`\`\`

**Other databases:** PostgreSQL uses \`EXTRACT(YEAR FROM date_col)\`, MySQL uses \`YEAR(date_col)\`. The ideas are the same.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'What type is typically used to store a date without time in standard SQL?',
        options: [
          { text: 'TEXT', isCorrect: false },
          { text: 'DATE', isCorrect: true },
          { text: 'TIMESTAMP', isCorrect: false },
          { text: 'INTEGER', isCorrect: false }
        ],
        explanation: 'DATE stores year/month/day without time. TIMESTAMP includes time of day. SQLite is typeless and stores dates as TEXT by convention.'
      }
    ],
    queryProblems: [
      {
        title: 'Hires per year',
        prompt: "Using strftime, return each employee's name and the year they were hired. Columns: name, hire_year.",
        starterQuery: '',
        solutionQuery: "SELECT name, strftime('%Y', hire_date) AS hire_year FROM employees;",
        difficulty: 'Medium'
      },
      {
        title: 'Orders in 2024',
        prompt: "Return all orders placed in 2024. Use strftime on order_date. Return all columns.",
        starterQuery: '',
        solutionQuery: "SELECT * FROM orders WHERE strftime('%Y', order_date) = '2024';",
        difficulty: 'Medium'
      }
    ]
  },

  // ============ LESSON 15 ============
  {
    lessonNumber: 15,
    title: 'Window Functions: ROW_NUMBER, RANK, DENSE_RANK',
    description: 'Add row-level computations without collapsing rows — essential for interview questions.',
    difficulty: 'Advanced',
    conceptExplanation: `Window functions compute a value for each row based on a "window" of related rows — without collapsing them like GROUP BY does.

\`\`\`sql
SELECT name, department_id, salary,
  ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn
FROM employees;
\`\`\`

- \`PARTITION BY\` — split rows into independent groups (like mini-queries)
- \`ORDER BY\` — order rows within each partition
- \`ROW_NUMBER\` — sequential number, no ties
- \`RANK\` — ties share a rank, next rank skips (1, 2, 2, 4)
- \`DENSE_RANK\` — ties share, no skip (1, 2, 2, 3)

**Classic interview use:** "top N per group":

\`\`\`sql
WITH ranked AS (
  SELECT name, department_id, salary,
    ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn
  FROM employees
)
SELECT name, department_id, salary FROM ranked WHERE rn = 1;
\`\`\`

Returns the highest earner in each department.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'If three employees tie for the highest salary, how do RANK and DENSE_RANK differ?',
        options: [
          { text: 'RANK gives them 1,1,1 then next is 4; DENSE_RANK gives 1,1,1 then next is 2', isCorrect: true },
          { text: 'RANK always gives unique ranks; DENSE_RANK allows ties', isCorrect: false },
          { text: 'They are identical', isCorrect: false },
          { text: 'DENSE_RANK raises an error on ties', isCorrect: false }
        ],
        explanation: 'RANK leaves gaps after ties; DENSE_RANK does not. ROW_NUMBER always produces unique numbers even with ties, but the order among tied rows is unspecified.'
      },
      {
        question: 'What does PARTITION BY do in a window function?',
        options: [
          { text: 'Physically splits the table on disk', isCorrect: false },
          { text: 'Divides rows into independent groups; the window function is reset per group', isCorrect: true },
          { text: 'Same as GROUP BY', isCorrect: false },
          { text: 'Sorts the result set', isCorrect: false }
        ],
        explanation: 'PARTITION BY is logical — it scopes the window function. Rows are still returned individually, unlike GROUP BY.'
      }
    ],
    queryProblems: [
      {
        title: 'Rank employees by salary within department',
        prompt: 'Return name, department_id, salary, and a column rn with ROW_NUMBER() ordered by salary DESC, partitioned by department_id.',
        starterQuery: '',
        solutionQuery: 'SELECT name, department_id, salary, ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn FROM employees;',
        difficulty: 'Hard'
      },
      {
        title: 'Top earner per department',
        prompt: 'Return the name, department_id, and salary of the highest-paid employee in each department.',
        starterQuery: 'WITH ',
        solutionQuery: 'WITH ranked AS (SELECT name, department_id, salary, ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn FROM employees) SELECT name, department_id, salary FROM ranked WHERE rn = 1;',
        hint: 'Wrap in a CTE and filter rn = 1.',
        difficulty: 'Hard'
      }
    ]
  },

  // ============ LESSON 16 ============
  {
    lessonNumber: 16,
    title: 'LAG, LEAD & Running Totals',
    description: 'Compare rows with neighbors and compute cumulative aggregates.',
    difficulty: 'Advanced',
    conceptExplanation: `**LAG(col)** returns the value from the previous row. **LEAD(col)** returns the next row. Useful for month-over-month comparisons.

\`\`\`sql
SELECT order_date, total_amount,
  LAG(total_amount) OVER (ORDER BY order_date) AS prev_amount
FROM orders;
\`\`\`

**Running totals** — aggregate with an ordered window:

\`\`\`sql
SELECT order_date, total_amount,
  SUM(total_amount) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM orders;
\`\`\`

The ROWS frame can be omitted for the default (UNBOUNDED PRECEDING to CURRENT ROW when ORDER BY is present), but being explicit is clearer.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'What does LAG(x) OVER (ORDER BY d) return for the very first row?',
        options: [
          { text: '0', isCorrect: false },
          { text: 'NULL', isCorrect: true },
          { text: 'An error', isCorrect: false },
          { text: 'The value from the last row', isCorrect: false }
        ],
        explanation: 'There is no previous row for the first row, so LAG returns NULL. You can supply a default: LAG(x, 1, 0).'
      }
    ],
    queryProblems: [
      {
        title: 'Running order total',
        prompt: 'Return order_date, total_amount, and a running_total column that sums total_amount from the earliest order through the current one, ordered by order_date.',
        starterQuery: '',
        solutionQuery: 'SELECT order_date, total_amount, SUM(total_amount) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM orders;',
        orderMatters: true,
        difficulty: 'Hard'
      }
    ]
  },

  // ============ LESSON 17 ============
  {
    lessonNumber: 17,
    title: 'INSERT, UPDATE & DELETE',
    description: 'Modify data with the three DML verbs.',
    difficulty: 'Intermediate',
    conceptExplanation: `**INSERT**:
\`\`\`sql
INSERT INTO products (id, name, category, price, stock)
VALUES (9, 'USB Cable', 'Electronics', 300, 500);
\`\`\`

**UPDATE** — always use WHERE, or you update every row:
\`\`\`sql
UPDATE products SET price = price * 1.10 WHERE category = 'Electronics';
\`\`\`

**DELETE** — same warning:
\`\`\`sql
DELETE FROM products WHERE stock = 0;
\`\`\`

**Pro tip:** wrap destructive changes in a transaction. If you forget WHERE in UPDATE/DELETE in production, the WHERE-less version modifies every row — always run SELECT with the same WHERE first to preview impact.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'What happens if you run `UPDATE employees SET salary = 0;` without WHERE?',
        options: [
          { text: 'Syntax error', isCorrect: false },
          { text: 'Every row in employees is updated to salary 0', isCorrect: true },
          { text: 'Only the first row is updated', isCorrect: false },
          { text: 'Nothing — SQL refuses the query', isCorrect: false }
        ],
        explanation: 'This is one of the most common production incidents. Always verify your WHERE clause with a SELECT first.'
      }
    ],
    queryProblems: [
      {
        title: 'Insert a new product',
        prompt: "Insert a new product: id=9, name='USB Cable', category='Electronics', price=300, stock=500. Then SELECT * FROM products WHERE id = 9.",
        starterQuery: '',
        solutionQuery: "INSERT INTO products (id, name, category, price, stock) VALUES (9, 'USB Cable', 'Electronics', 300, 500); SELECT * FROM products WHERE id = 9;",
        hint: 'Two statements separated by a semicolon.',
        difficulty: 'Medium'
      }
    ]
  },

  // ============ LESSON 18 ============
  {
    lessonNumber: 18,
    title: 'Schema Design: Constraints, PK & FK',
    description: 'Primary keys, foreign keys, NOT NULL, UNIQUE, CHECK, and default values.',
    difficulty: 'Intermediate',
    conceptExplanation: `Constraints enforce data integrity at the database level — always stronger than application-level checks.

- **PRIMARY KEY** — uniquely identifies a row. Implicitly NOT NULL and UNIQUE.
- **FOREIGN KEY** — references the PK of another table. Prevents "orphan" rows.
- **NOT NULL** — value must be provided.
- **UNIQUE** — no two rows can share this value.
- **CHECK** — custom condition (e.g. \`CHECK (salary >= 0)\`).
- **DEFAULT** — value used if INSERT omits the column.

\`\`\`sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  owner_id INTEGER,
  budget INTEGER CHECK (budget >= 0),
  status TEXT DEFAULT 'open',
  FOREIGN KEY (owner_id) REFERENCES employees(id)
);
\`\`\`

**Composite PK** — primary key over multiple columns: \`PRIMARY KEY (col_a, col_b)\`.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'Which two properties does PRIMARY KEY enforce automatically?',
        options: [
          { text: 'UNIQUE and NOT NULL', isCorrect: true },
          { text: 'UNIQUE and INDEXED', isCorrect: false },
          { text: 'NOT NULL only', isCorrect: false },
          { text: 'UNIQUE only', isCorrect: false }
        ],
        explanation: 'A PRIMARY KEY is automatically UNIQUE and NOT NULL. Databases also create an index on it.'
      },
      {
        question: 'What does a FOREIGN KEY prevent?',
        options: [
          { text: 'Duplicate values in the referenced table', isCorrect: false },
          { text: "Insertions that don't have a matching row in the referenced table (orphans)", isCorrect: true },
          { text: 'NULL values in the column', isCorrect: false },
          { text: 'Reading from the referenced table', isCorrect: false }
        ],
        explanation: 'FK enforces referential integrity — you cannot insert a row pointing to a non-existent parent.'
      }
    ],
    queryProblems: [
      {
        title: 'Count rows in parent table',
        prompt: 'How many departments are there? Alias dept_count.',
        starterQuery: '',
        solutionQuery: 'SELECT COUNT(*) AS dept_count FROM departments;',
        difficulty: 'Easy'
      }
    ]
  },

  // ============ LESSON 19 ============
  {
    lessonNumber: 19,
    title: 'Normalization: 1NF, 2NF, 3NF, BCNF',
    description: 'Organize data to reduce redundancy and avoid update anomalies. Heavy theory — interview favorite.',
    difficulty: 'Advanced',
    conceptExplanation: `Normalization is the process of decomposing tables to eliminate redundancy.

**1NF — First Normal Form**
- Every column holds atomic values (no comma-separated lists, no repeating groups).
- Each row is unique.

**2NF — Second Normal Form**
- 1NF + every non-key column depends on the *whole* primary key (not just part of it).
- Matters for composite PKs. Fix partial dependencies by splitting.

**3NF — Third Normal Form**
- 2NF + no transitive dependencies (non-key → non-key).
- Example violation: \`employees(id, dept_id, dept_name)\` — \`dept_name\` depends on \`dept_id\`, not directly on \`id\`. Move \`dept_name\` to \`departments\`.

**BCNF — Boyce-Codd Normal Form**
- Stricter 3NF: every determinant is a candidate key.

**Denormalization** is the deliberate reverse — accept redundancy for read performance. Used in analytics and read-heavy systems.

**Tradeoffs:** normalized = less redundancy, harder reads (more joins). Denormalized = faster reads, update anomalies.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'A table has columns (student_id, course_id, course_name). (student_id, course_id) is the PK. What normalization form is this in?',
        options: [
          { text: '3NF', isCorrect: false },
          { text: '1NF but violates 2NF (course_name depends only on course_id, not the whole PK)', isCorrect: true },
          { text: 'BCNF', isCorrect: false },
          { text: 'Not in any normal form', isCorrect: false }
        ],
        explanation: 'course_name depends only on course_id (partial dependency on the composite PK) → violates 2NF. Fix: move course_name to a courses table.'
      },
      {
        question: 'Which of the following is a reason to DENORMALIZE?',
        options: [
          { text: 'To enforce referential integrity', isCorrect: false },
          { text: 'To save disk space', isCorrect: false },
          { text: 'To avoid expensive joins in read-heavy workloads', isCorrect: true },
          { text: 'To make writes atomic', isCorrect: false }
        ],
        explanation: 'Denormalization trades extra storage and update complexity for faster reads — common in data warehouses and caches.'
      },
      {
        question: 'What does 1NF require?',
        options: [
          { text: 'A primary key on every table', isCorrect: false },
          { text: 'Atomic (indivisible) values in every column', isCorrect: true },
          { text: 'Foreign keys on all non-key columns', isCorrect: false },
          { text: 'Indexes on all columns', isCorrect: false }
        ],
        explanation: '1NF is about atomicity — no lists, arrays, or repeating groups in a single cell.'
      }
    ],
    queryProblems: [
      {
        title: 'Identify duplication (conceptual via query)',
        prompt: 'As a check, return the department name of the employee with id = 1 by joining employees and departments. Columns: employee_name, department_name.',
        starterQuery: '',
        solutionQuery: 'SELECT e.name AS employee_name, d.name AS department_name FROM employees e JOIN departments d ON e.department_id = d.id WHERE e.id = 1;',
        explanation: 'Because we store department_id (not department_name) in employees, renaming a department updates one row instead of many. This is the practical benefit of 3NF.',
        difficulty: 'Easy'
      }
    ]
  },

  // ============ LESSON 20 ============
  {
    lessonNumber: 20,
    title: 'Indexes, Transactions & ACID',
    description: 'Performance tuning and correctness guarantees — the DBMS fundamentals interviewers love.',
    difficulty: 'Advanced',
    conceptExplanation: `**Indexes** — auxiliary data structures (usually B-trees) that speed up lookups:

\`\`\`sql
CREATE INDEX idx_employees_salary ON employees(salary);
\`\`\`

- **Pros:** faster SELECT/WHERE/JOIN/ORDER BY on indexed columns.
- **Cons:** slower INSERT/UPDATE/DELETE (index must be maintained); extra disk space.
- Primary keys are indexed automatically.

**Transactions** — a group of statements treated as one unit:

\`\`\`sql
BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- or ROLLBACK to undo
\`\`\`

**ACID properties** — the transactional guarantees:
- **A**tomicity — all statements succeed or none do
- **C**onsistency — data moves between valid states (constraints hold)
- **I**solation — concurrent transactions do not see each other's partial work
- **D**urability — once committed, changes survive crashes

**Isolation levels:** READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE — each trades concurrency for stricter correctness.`,
    schemaDescription: companySchemaDesc,
    setupSql: companyDbSetup,
    theoryMcqs: [
      {
        question: 'What does the "A" in ACID stand for?',
        options: [
          { text: 'Availability', isCorrect: false },
          { text: 'Atomicity', isCorrect: true },
          { text: 'Accuracy', isCorrect: false },
          { text: 'Asynchrony', isCorrect: false }
        ],
        explanation: 'Atomicity — the transaction is all-or-nothing. Availability is from CAP theorem, not ACID.'
      },
      {
        question: 'What is a downside of adding many indexes to a table?',
        options: [
          { text: 'SELECTs become slower', isCorrect: false },
          { text: 'INSERT/UPDATE/DELETE become slower because every index must be maintained', isCorrect: true },
          { text: 'The database rejects more than 3 indexes', isCorrect: false },
          { text: 'Primary keys stop working', isCorrect: false }
        ],
        explanation: 'Every write has to update every index. Indexes are a read/write tradeoff — add them where queries actually need them.'
      },
      {
        question: 'Two transactions each transfer money between the same two accounts. Which isolation level fully prevents anomalies at the cost of concurrency?',
        options: [
          { text: 'READ UNCOMMITTED', isCorrect: false },
          { text: 'READ COMMITTED', isCorrect: false },
          { text: 'REPEATABLE READ', isCorrect: false },
          { text: 'SERIALIZABLE', isCorrect: true }
        ],
        explanation: 'SERIALIZABLE ensures the outcome is equivalent to running the transactions one after another. It is the strictest and the slowest.'
      }
    ],
    queryProblems: [
      {
        title: 'Transaction simulation',
        prompt: "Inside a BEGIN/COMMIT block, insert a new employee (id=11, name='Test User', department_id=1, salary=60000, hire_date='2024-10-01', manager_id=1). Then SELECT * FROM employees WHERE id = 11.",
        starterQuery: 'BEGIN TRANSACTION;\n',
        solutionQuery: "BEGIN TRANSACTION; INSERT INTO employees VALUES (11, 'Test User', 1, 60000, '2024-10-01', 1); COMMIT; SELECT * FROM employees WHERE id = 11;",
        hint: 'BEGIN TRANSACTION; ... ; COMMIT; SELECT ...',
        difficulty: 'Medium'
      }
    ]
  }
];

const seedDB = async () => {
  try {
    await SqlLesson.deleteMany({});
    console.log('Cleared existing SQL lessons.');

    await SqlLesson.insertMany(lessons);
    console.log(`Seeded ${lessons.length} SQL lessons.`);

    process.exit();
  } catch (err) {
    console.error('SQL seeding error:', err);
    process.exit(1);
  }
};

setTimeout(seedDB, 1500);
