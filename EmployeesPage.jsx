import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import { employeeService } from '../services/employeeService';
import { 
  FaUsers, 
  FaCheckCircle, 
  FaTimes, 
  FaSearch, 
  FaPlus, 
  FaEnvelope, 
  FaIdCard, 
  FaCalendar, 
  FaEye 
} from 'react-icons/fa';
import './EmployeesPage.css';

const EmployeesPage = forwardRef(({ onAddEmployee }, ref) => {
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]); // Store all employees for local filtering fallback
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refresh: fetchEmployees
  }));

  // Fetch employees from Supabase on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getAllEmployees();
      // Transform data to match component expectations
      const transformedData = data.map(emp => ({
        ...emp,
        employeeId: emp.employee_id,
        dateOfJoining: emp.date_of_joining,
        documents: emp.documents || []
      }));
      setEmployees(transformedData);
      setAllEmployees(transformedData); // Store for local filtering fallback
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees. Please check your database connection.');
      // Keep empty array if fetch fails
      setEmployees([]);
      setAllEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setIsDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedEmployee(null);
  };

  // Use Supabase search when filters are applied, otherwise fetch all
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || filterStatus !== 'all' || filterDepartment !== 'all') {
        searchEmployees();
      } else {
        fetchEmployees();
      }
    }, searchTerm ? 300 : 0); // Debounce search input

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, filterDepartment]);

  const searchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.searchEmployees(searchTerm || '', {
        status: filterStatus,
        department: filterDepartment
      });
      const transformedData = data.map(emp => ({
        ...emp,
        employeeId: emp.employee_id,
        dateOfJoining: emp.date_of_joining,
        documents: emp.documents || []
      }));
      setEmployees(transformedData);
    } catch (err) {
      console.error('Error searching employees:', err);
      setError('Search failed. Using local filter.');
      // Fallback to local filtering using allEmployees
      const filtered = allEmployees.filter(employee => {
        const matchesSearch = 
          !searchTerm ||
          employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (employee.employeeId || employee.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || employee.status === filterStatus;
        const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
        return matchesSearch && matchesStatus && matchesDepartment;
      });
      setEmployees(filtered);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const departments = [...new Set(employees.map(emp => emp.department))];
  const activeCount = employees.filter(emp => emp.status === 'Active').length;
  const resignedCount = employees.filter(emp => emp.status === 'Resigned').length;

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <h2>Employees</h2>
          <p>Manage all employees, view details, and update information.</p>
        </div>
        <button className="btn-add-employee" onClick={onAddEmployee}>
          <FaPlus /> Add New Employee
        </button>
      </div>

      {/* Summary Cards */}
      <div className="employees-summary">
        <div className="summary-card">
          <div className="summary-content">
            <div>
              <h3>Total Employees</h3>
              <div className="summary-value">
                <span className="value">{employees.length}</span>
              </div>
            </div>
            <div className="summary-icon employees-icon">
              <FaUsers />
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <div>
              <h3>Active</h3>
              <div className="summary-value">
                <span className="value">{activeCount}</span>
              </div>
            </div>
            <div className="summary-icon active-icon">
              <FaCheckCircle />
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <div>
              <h3>Resigned</h3>
              <div className="summary-value">
                <span className="value">{resignedCount}</span>
              </div>
            </div>
            <div className="summary-icon resigned-icon">
              <FaTimes />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="employees-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, email, or employee ID..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="filter-dropdown">
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Resigned">Resigned</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <select 
              className="filter-select"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="employees-table-container">
        <table className="employees-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Email</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Date of Joining</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading employees...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-cell">
                      <div className="employee-avatar">{employee.name.split(' ').map(n => n[0]).join('')}</div>
                      <span className="employee-name">{employee.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <FaEnvelope className="email-icon" />
                      <span>{employee.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="id-cell">
                      <FaIdCard className="id-icon" />
                      <span>{employee.employeeId}</span>
                    </div>
                  </td>
                  <td>
                    <span className="department-text">{employee.department}</span>
                  </td>
                  <td>
                    <span className="designation-text">{employee.designation}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${employee.status === 'Active' ? 'status-active' : 'status-resigned'}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td>
                    <div className="date-cell">
                      <FaCalendar className="date-icon" />
                      <span>{formatDate(employee.dateOfJoining)}</span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(employee)}
                    >
                      <FaEye /> View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Employee Details Modal */}
      {isDetailsModalOpen && selectedEmployee && (
        <EmployeeDetailsModal
          employee={selectedEmployee}
          onClose={handleCloseModal}
          formatDate={formatDate}
          calculateAge={calculateAge}
        />
      )}
    </div>
  );
});

EmployeesPage.displayName = 'EmployeesPage';

export default EmployeesPage;

