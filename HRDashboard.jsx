import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { employeeService } from '../services/employeeService';
import { leaveService } from '../services/leaveService';
import { supabase } from '../lib/supabase';
import AddEmployeeModal from './AddEmployeeModal';
import AddDepartmentModal from './AddDepartmentModal';
import EmployeesPage from './EmployeesPage';
import { 
  FaChartBar, 
  FaUsers, 
  FaBuilding, 
  FaCalendarCheck, 
  FaPlane, 
  FaDollarSign, 
  FaFileAlt, 
  FaUser, 
  FaSignOutAlt, 
  FaSearch, 
  FaBell, 
  FaCog, 
  FaPlus, 
  FaBullhorn, 
  FaCalendar,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaEllipsisV,
  FaCode,
  FaPaw,
  FaHeart,
  FaFilter,
  FaSort,
  FaCheck,
  FaTimes,
  FaClock,
  FaUmbrellaBeach,
  FaHeartbeat,
  FaStar,
  FaCalendarAlt,
  FaEye,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt as FaLocation,
  FaBirthdayCake,
  FaFilePdf,
  FaDownload
} from 'react-icons/fa';
import './HRDashboard.css';

const HRDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname.split('/').pop() || 'dashboard');
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false);
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
  const [isSavingDepartment, setIsSavingDepartment] = useState(false);
  const employeesPageRef = useRef(null);
  const departmentsPageRef = useRef(null);

  useEffect(() => {
    const loadPendingLeavesCount = async () => {
      try {
        const { count, error } = await supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        if (error) throw error;
        setPendingLeavesCount(count ?? 0);
      } catch (e) {
        console.error('Failed to load pending leave count:', e);
        setPendingLeavesCount(0);
      }
    };

    loadPendingLeavesCount();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Generate employee ID (format: EMP001, EMP002, etc.)
  const generateEmployeeId = async () => {
    try {
      // Get all employees to find the highest number
      const allEmployees = await employeeService.getAllEmployees();
      if (allEmployees.length === 0) {
        return 'EMP001';
      }
      
      // Extract numbers from existing employee IDs
      const employeeNumbers = allEmployees
        .map(emp => {
          const match = emp.employee_id?.match(/EMP(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0);
      
      const nextNumber = employeeNumbers.length > 0 
        ? Math.max(...employeeNumbers) + 1 
        : 1;
      
      return `EMP${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating employee ID:', error);
      // Fallback: use timestamp-based ID
      return `EMP${Date.now().toString().slice(-6)}`;
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      setIsSavingEmployee(true);
      
      // Generate employee ID
      const employeeId = await generateEmployeeId();
      
      // Transform form data to match database schema
      const employeePayload = {
        employee_id: employeeId,
        name: `${employeeData.firstName} ${employeeData.lastName}`.trim(),
        email: employeeData.email,
        phone: employeeData.phoneNumber || null,
        department: employeeData.department || null,
        designation: employeeData.designation || null,
        date_of_joining: employeeData.dateOfJoining || null,
        status: employeeData.accountStatus ? 'Active' : 'Resigned',
        // Note: profile_id would need to be created separately if creating auth user
        // For now, we'll leave it null and it can be linked later
        profile_id: null,
      };

      // Save to database
      await employeeService.createEmployee(employeePayload);
      
      // Refresh employees list if EmployeesPage is mounted
      if (employeesPageRef.current && typeof employeesPageRef.current.refresh === 'function') {
        employeesPageRef.current.refresh();
      }
      
      // Close modal
      setIsAddEmployeeModalOpen(false);
      
      // Show success message
      alert('Employee added successfully!');
      
      // If on employees page, switch to it to see the new employee
      if (activeTab !== 'employees') {
        setActiveTab('employees');
        navigate('/hr/employees');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      alert(`Failed to add employee: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSavingEmployee(false);
    }
  };

  const handleSaveDepartment = async (departmentData) => {
    try {
      setIsSavingDepartment(true);
      
      // Transform form data to match database schema
      const departmentPayload = {
        name: departmentData.name.trim(),
        location: departmentData.location.trim() || null,
        head_id: departmentData.headId || null,
      };

      // Save to database
      const { departmentService } = await import('../services/departmentService');
      await departmentService.createDepartment(departmentPayload);
      
      // Refresh departments list if DepartmentsPage is mounted
      if (departmentsPageRef.current && typeof departmentsPageRef.current.refresh === 'function') {
        departmentsPageRef.current.refresh();
      }
      
      // Close modal
      setIsAddDepartmentModalOpen(false);
      
      // Show success message
      alert('Department added successfully!');
      
      // If on departments page, switch to it to see the new department
      if (activeTab !== 'departments') {
        setActiveTab('departments');
        navigate('/hr/departments');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      alert(`Failed to add department: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSavingDepartment(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartBar, path: '/hr/dashboard' },
    { id: 'employees', label: 'Employees', icon: FaUsers, path: '/hr/employees' },
    { id: 'departments', label: 'Departments', icon: FaBuilding, path: '/hr/departments' },
    { id: 'attendance', label: 'Attendance', icon: FaCalendarCheck, path: '/hr/attendance' },
    { id: 'leaves', label: 'Leaves', icon: FaPlane, path: '/hr/leaves', badge: pendingLeavesCount || null },
    { id: 'payroll', label: 'Payroll', icon: FaDollarSign, path: '/hr/payroll' },
    { id: 'documents', label: 'Documents', icon: FaFileAlt, path: '/hr/documents' },
  ];

  const handleMenuClick = (item) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  return (
    <div className="hr-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>HR Flow HRMS</h2>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item)}
            >
              <span className="nav-icon"><item.icon /></span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" onClick={() => navigate('/hr/profile')}>
            <span className="nav-icon"><FaUser /></span>
            <span className="nav-label">My Profile</span>
          </div>
          <div className="nav-item logout" onClick={handleLogout}>
            <span className="nav-icon"><FaSignOutAlt /></span>
            <span className="nav-label">Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>HR Flow HRMS System</h1>
          </div>
          <div className="header-center">
            <div className="search-bar">
              <span className="search-icon"><FaSearch /></span>
              <input type="text" placeholder="Search..." />
            </div>
          </div>
          <div className="header-right">
            <span className="header-icon"><FaBell /></span>
            <span className="header-icon"><FaCog /></span>
            <div className="user-profile">
              <div className="profile-avatar">{user?.name?.charAt(0) || 'U'}</div>
              <div className="profile-info">
                <span className="profile-name">{user?.name || 'User'}</span>
                <span className="profile-role">{user?.position || 'HR Manager'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {activeTab === 'dashboard' && <DashboardOverview onAddEmployee={() => setIsAddEmployeeModalOpen(true)} />}
          {activeTab === 'employees' && <EmployeesPage ref={employeesPageRef} onAddEmployee={() => setIsAddEmployeeModalOpen(true)} />}
          {activeTab === 'departments' && <DepartmentsPage ref={departmentsPageRef} onAddDepartment={() => setIsAddDepartmentModalOpen(true)} />}
          {activeTab === 'attendance' && <AttendancePage />}
          {activeTab === 'leaves' && <LeavesPage />}
          {activeTab === 'payroll' && <PayrollPage />}
          {activeTab === 'documents' && <DocumentsPage />}
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
        isLoading={isSavingEmployee}
      />

      {/* Add Department Modal */}
      <AddDepartmentModal
        isOpen={isAddDepartmentModalOpen}
        onClose={() => setIsAddDepartmentModalOpen(false)}
        onSave={handleSaveDepartment}
        isLoading={isSavingDepartment}
      />
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ onAddEmployee }) => {
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newEmployeesLast30Days: 0,
    pendingLeaves: 0,
    absentToday: 0,
    totalDepartments: 0,
    deptBreakdown: [], // [{ name, count, percent, colorClass }]
  });

  useEffect(() => {
    const loadOverviewStats = async () => {
      try {
        setLoadingStats(true);

        // Total active employees
        const { count: totalEmployees, error: totalEmpError } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Active');
        if (totalEmpError) throw totalEmpError;

        // New employees (based on date_of_joining) last 30 days
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const sinceISO = since.toISOString().slice(0, 10); // yyyy-mm-dd
        const { data: newJoinees, error: newEmpError } = await supabase
          .from('employees')
          .select('id')
          .eq('status', 'Active')
          .gte('date_of_joining', sinceISO);
        if (newEmpError) throw newEmpError;

        // Pending leaves
        const { count: pendingLeaves, error: pendingError } = await supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        if (pendingError) throw pendingError;

        // Department count
        const { count: totalDepartments, error: deptCountError } = await supabase
          .from('departments')
          .select('*', { count: 'exact', head: true });
        if (deptCountError) throw deptCountError;

        // Department headcount breakdown (Active employees)
        const { data: deptEmployees, error: deptEmpError } = await supabase
          .from('employees')
          .select('department')
          .eq('status', 'Active');
        if (deptEmpError) throw deptEmpError;

        const countsByDept = (deptEmployees || []).reduce((acc, row) => {
          const dept = row.department || 'Unassigned';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {});

        const total = totalEmployees ?? 0;
        const colors = ['blue', 'purple', 'orange', 'green'];
        const deptBreakdown = Object.entries(countsByDept)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name, count], idx) => ({
            name,
            count,
            percent: total > 0 ? Math.round((count / total) * 100) : 0,
            colorClass: colors[idx % colors.length],
          }));

        setStats({
          totalEmployees: totalEmployees ?? 0,
          newEmployeesLast30Days: newJoinees?.length ?? 0,
          pendingLeaves: pendingLeaves ?? 0,
          absentToday: 0, // Attendance module not connected yet
          totalDepartments: totalDepartments ?? 0,
          deptBreakdown,
        });
      } catch (e) {
        console.error('Failed to load dashboard overview stats:', e);
        setStats({
          totalEmployees: 0,
          newEmployeesLast30Days: 0,
          pendingLeaves: 0,
          absentToday: 0,
          totalDepartments: 0,
          deptBreakdown: [],
        });
      } finally {
        setLoadingStats(false);
      }
    };

    loadOverviewStats();
  }, []);

  return (
    <div className="dashboard-overview">
      <h2>Overview</h2>
      
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon"><FaUsers /></div>
          <div className="metric-content">
            <h3>Total Employees</h3>
            <p className="metric-value">{loadingStats ? '...' : stats.totalEmployees}</p>
            <p className="metric-change positive">
              {loadingStats ? '...' : `+${stats.newEmployeesLast30Days} new (last 30 days)`}
            </p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon"><FaCalendarCheck /></div>
          <div className="metric-content">
            <h3>Today's Attendance</h3>
            <p className="metric-value">92%</p>
            <p className="metric-change negative">{stats.absentToday ? `${stats.absentToday} absent` : '—'}</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon"><FaFileAlt /></div>
          <div className="metric-content">
            <h3>Pending Leaves</h3>
            <p className="metric-value">{loadingStats ? '...' : stats.pendingLeaves}</p>
            <p className="metric-change">Action Req.</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon"><FaCheckCircle /></div>
          <div className="metric-content">
            <h3>Payroll Status</h3>
            <p className="metric-value">Ready</p>
            <p className="metric-change">Oct 30 Run</p>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Weekly Attendance Trends</h3>
              <p>Average 95% over last 7 days</p>
            </div>
            <div className="view-toggle">
              <button className="toggle-active">Weekly</button>
              <button>Monthly</button>
            </div>
          </div>
          <div className="chart-placeholder">
            <div className="bar-chart">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div key={day} className="bar-container">
                  <div 
                    className={`bar ${idx === 3 || idx === 4 ? 'bar-high' : ''}`}
                    style={{ height: `${60 + Math.random() * 40}%` }}
                  ></div>
                  <span>{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Department Headcount</h3>
              <p>{loadingStats ? 'Loading...' : `Total ${stats.totalDepartments} Departments`}</p>
            </div>
          </div>
          <div className="headcount-content">
            <div className="headcount-total">{loadingStats ? '...' : `${stats.totalEmployees} TOTAL`}</div>
            <div className="headcount-legend">
              {loadingStats ? (
                <div className="legend-item">
                  <span className="legend-dot blue"></span>
                  <span>Loading...</span>
                </div>
              ) : stats.deptBreakdown.length === 0 ? (
                <div className="legend-item">
                  <span className="legend-dot blue"></span>
                  <span>No department data</span>
                </div>
              ) : (
                stats.deptBreakdown.map((d) => (
                  <div key={d.name} className="legend-item">
                    <span className={`legend-dot ${d.colorClass}`}></span>
                    <span>{d.name} ({d.percent}%)</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Recent Activity</h3>
            </div>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="activity-table">
            <table>
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>ACTION</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="employee-cell">
                      <div className="employee-avatar">JD</div>
                      <div>
                        <div>John Doe</div>
                        <div className="employee-dept">Engineering</div>
                      </div>
                    </div>
                  </td>
                  <td>Requested Sick Leave</td>
                  <td>Oct 24, 2023</td>
                  <td><span className="status-badge pending">Pending</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="employee-cell">
                      <div className="employee-avatar">AS</div>
                      <div>
                        <div>Alice Smith</div>
                        <div className="employee-dept">Marketing</div>
                      </div>
                    </div>
                  </td>
                  <td>Submitted Expense Report</td>
                  <td>Oct 23, 2023</td>
                  <td><span className="status-badge approved">Approved</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="employee-cell">
                      <div className="employee-avatar">RF</div>
                      <div>
                        <div>Robert Fox</div>
                        <div className="employee-dept">Sales</div>
                      </div>
                    </div>
                  </td>
                  <td>New Onboarding</td>
                  <td>Oct 23, 2023</td>
                  <td><span className="status-badge in-progress">In Progress</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Quick Actions</h3>
            </div>
          </div>
          <div className="quick-actions">
            <button 
              className="action-btn primary"
              onClick={onAddEmployee}
            >
              <span><FaPlus /></span>
              Add New Employee
            </button>
            <button className="action-btn">
              <span><FaBullhorn /></span>
              Make Announcement
            </button>
            <button className="action-btn">
              <span><FaCalendar /></span>
              Schedule Interview
            </button>
          </div>
          <div className="system-status">
            <span className="status-dot green"></span>
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other pages

const DepartmentsPage = forwardRef(({ onAddDepartment }, ref) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');

  // Icon mapping for departments
  const getDepartmentIcon = (name) => {
    const iconMap = {
      'Engineering': FaCode,
      'Marketing': FaBullhorn,
      'Product Design': FaPaw,
      'Sales': FaDollarSign,
      'Human Resources': FaHeart,
      'HR': FaHeart,
      'Finance': FaDollarSign,
      'Operations': FaBuilding,
      'IT': FaCode,
      'Design': FaPaw
    };
    return iconMap[name] || FaBuilding;
  };

  const getDepartmentIconColor = (name) => {
    const colorMap = {
      'Engineering': '#2563eb',
      'Marketing': '#ec4899',
      'Product Design': '#f97316',
      'Sales': '#10b981',
      'Human Resources': '#a855f7',
      'HR': '#a855f7',
      'Finance': '#10b981',
      'Operations': '#6b7280',
      'IT': '#2563eb',
      'Design': '#f97316'
    };
    return colorMap[name] || '#6b7280';
  };

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refresh: fetchDepartments
  }));

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const { departmentService } = await import('../services/departmentService');
      const { employeeService } = await import('../services/employeeService');
      const { supabase } = await import('../lib/supabase');
      
      const deptsData = await departmentService.getAllDepartments();
      
      // Fetch employee counts for each department directly from employees table
      const departmentsWithDetails = await Promise.all(
        deptsData.map(async (dept) => {
          try {
            // Count employees in this department directly from employees table (Active only)
            const { count, error: countError } = await supabase
              .from('employees')
              .select('*', { count: 'exact', head: true })
              .eq('department', dept.name)
              .eq('status', 'Active');
            
            // Get employee names for avatars (only first 3 active employees)
            const { data: employeesData } = await supabase
              .from('employees')
              .select('name')
              .eq('department', dept.name)
              .eq('status', 'Active')
              .limit(3);
            
            // Use count from database query, fallback to 0 if error
            const employeeCount = (countError || count === null) ? 0 : count;
            
            // Get department head details
            let head = null;
            if (dept.head_id && dept.employees && dept.employees.length > 0) {
              const headData = dept.employees[0];
              head = {
                name: headData.name,
                email: headData.email,
                avatar: headData.name.split(' ').map(n => n[0]).join('').toUpperCase()
              };
            }
            
            // Get member avatars (first 3 active employees from database)
            const memberAvatars = (employeesData || [])
              .map(emp => emp.name.split(' ').map(n => n[0]).join('').toUpperCase());
            
            return {
              id: dept.id,
              name: dept.name,
              icon: getDepartmentIcon(dept.name),
              iconColor: getDepartmentIconColor(dept.name),
              location: dept.location || 'Not specified',
              head: head || {
                name: 'Not assigned',
                email: '',
                avatar: 'NA'
              },
              members: employeeCount, // Direct count from employees table
              memberAvatars
            };
          } catch (err) {
            console.error(`Error processing department ${dept.name}:`, err);
            return {
              id: dept.id,
              name: dept.name,
              icon: getDepartmentIcon(dept.name),
              iconColor: getDepartmentIconColor(dept.name),
              location: dept.location || 'Not specified',
              head: {
                name: 'Not assigned',
                email: '',
                avatar: 'NA'
              },
              members: 0,
              memberAvatars: []
            };
          }
        })
      );
      
      setDepartments(departmentsWithDetails);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments. Please check your database connection.');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = 
      !searchTerm ||
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.head.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'all' || dept.location === filterLocation;
    return matchesSearch && matchesLocation;
  });

  const locations = [...new Set(departments.map(dept => dept.location))];
  const totalEmployees = departments.reduce((sum, dept) => sum + dept.members, 0);

  return (
    <div className="departments-page">
      <div className="departments-header">
        <div>
          <h2>Departments</h2>
          <p>Manage your organization's internal structure and teams.</p>
        </div>
        <button className="btn-add-department" onClick={onAddDepartment}>
          <FaPlus /> Add New Department
        </button>
      </div>

      {/* Summary Cards */}
      <div className="departments-summary">
        <div className="summary-card">
          <div className="summary-content">
            <div>
              <h3>Total Departments</h3>
              <div className="summary-value">
                <span className="value">{loading ? '...' : departments.length}</span>
              </div>
            </div>
            <div className="summary-icon building">
              <FaBuilding />
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <div>
              <h3>Total Employees</h3>
              <div className="summary-value">
                <span className="value">{loading ? '...' : totalEmployees}</span>
              </div>
            </div>
            <div className="summary-icon employees">
              <FaUsers />
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <div>
              <h3>Locations</h3>
              <div className="summary-value">
                <span className="value">{loading ? '...' : locations.length}</span>
                <span className="sub-text">Unique Locations</span>
              </div>
            </div>
            <div className="summary-icon positions">
              <FaMapMarkerAlt />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="departments-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search departments, managers..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="filter-dropdown">
            <FaFilter className="filter-icon" />
            <select 
              className="filter-select"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ padding: '16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Department Cards Grid */}
      <div className="departments-grid">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            Loading departments...
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            {error ? 'Failed to load departments' : 'No departments found matching your criteria.'}
          </div>
        ) : (
          filteredDepartments.map((dept) => {
            const IconComponent = dept.icon;
            return (
            <div key={dept.id} className="department-card">
              <div className="department-card-header">
                <div 
                  className="department-icon" 
                  style={{ backgroundColor: `${dept.iconColor}20`, color: dept.iconColor }}
                >
                  {IconComponent && <IconComponent />}
                </div>
                <button className="card-menu-btn">
                  <FaEllipsisV />
                </button>
              </div>
            
            <div className="department-card-body">
              <h3 className="department-name">{dept.name}</h3>
              
              <div className="department-location">
                <FaMapMarkerAlt className="location-icon" />
                <span>{dept.location}</span>
              </div>

              <div className="department-head">
                <div className="head-avatar">{dept.head.avatar}</div>
                <div className="head-info">
                  <div className="head-name">{dept.head.name}</div>
                  <div className="head-email">{dept.head.email}</div>
                </div>
              </div>

              <div className="department-members">
                <div className="member-avatars">
                  {dept.memberAvatars.map((avatar, idx) => (
                    <div key={idx} className="member-avatar">{avatar}</div>
                  ))}
                  {dept.members > 3 && (
                    <span className="member-count">+{dept.members - 3}</span>
                  )}
                </div>
                <div className="member-total">{dept.members} {dept.members === 1 ? 'member' : 'members'}</div>
              </div>
            </div>
          </div>
          );
          })
        )}
      </div>
    </div>
  );
});

DepartmentsPage.displayName = 'DepartmentsPage';

const AttendancePage = () => (
  <div className="page-content">
    <h2>Attendance</h2>
    <p>View and manage employee attendance records.</p>
  </div>
);

const LeavesPage = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getLeaveTypeMeta = (leaveType) => {
    const type = (leaveType || '').toLowerCase();
    if (type.includes('sick')) return { icon: FaHeartbeat, color: '#ec4899', label: 'Sick Leave' };
    if (type.includes('casual')) return { icon: FaCalendarAlt, color: '#10b981', label: 'Casual Leave' };
    if (type.includes('privilege')) return { icon: FaStar, color: '#f97316', label: 'Privilege Leave' };
    if (type.includes('vacation')) return { icon: FaUmbrellaBeach, color: '#2563eb', label: 'Vacation' };
    return { icon: FaCalendarAlt, color: '#6b7280', label: leaveType || 'Leave' };
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await leaveService.getAllLeaves();

      const transformed = (rows || []).map((r) => {
        const emp = r.employees || {};
        const avatar = (emp.name || 'NA')
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((n) => n[0]?.toUpperCase())
          .join('') || 'NA';

        const meta = getLeaveTypeMeta(r.leave_type);
        const startDate = r.start_date || r.from_date || r.startDate;
        const endDate = r.end_date || r.to_date || r.endDate;
        const days = r.days ?? r.total_days ?? null;

        return {
          id: r.id,
          employee: {
            name: emp.name || 'Unknown',
            avatar,
            department: emp.department || 'N/A',
            email: emp.email || '',
          },
          leaveType: meta.label,
          leaveTypeIcon: meta.icon,
          leaveTypeColor: meta.color,
          startDate,
          endDate,
          days: days ?? 0,
          duration: days ? `${days} ${days === 1 ? 'day' : 'days'}` : '—',
          reason: r.reason || '—',
          status: (r.status || 'pending').toLowerCase(),
          appliedDate: r.applied_on || r.created_at || null,
        };
      });

      setLeaveRequests(transformed);
    } catch (e) {
      console.error('Error fetching leaves:', e);
      setError('Failed to load leave requests. Please check your database connection.');
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistic UI update
      setLeaveRequests((prev) =>
        prev.map((leave) => (leave.id === id ? { ...leave, status: newStatus } : leave))
      );

      await leaveService.updateLeaveStatus(id, newStatus, user?.id || null);
    } catch (e) {
      console.error('Failed to update leave status:', e);
      // Rollback by refetching
      fetchLeaves();
    }
  };

  const filteredLeaves = leaveRequests.filter(leave => {
    const matchesStatus = filterStatus === 'all' || leave.status === filterStatus;
    const matchesSearch = 
      leave.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  const pendingCount = leaveRequests.filter(l => l.status === 'pending').length;
  const approvedCount = leaveRequests.filter(l => l.status === 'approved').length;
  const rejectedCount = leaveRequests.filter(l => l.status === 'rejected').length;

  return (
    <div className="leaves-page">
      <div className="leaves-header">
        <div>
          <h2>Leave Management</h2>
          <p>Review and manage employee leave requests</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="leaves-summary">
        <div className="summary-card">
          <div className="summary-content">
            <div>
              <h3>Pending Requests</h3>
              <div className="summary-value">
                <span className="value">{pendingCount}</span>
              </div>
            </div>
            <div className="summary-icon pending-icon">
              <FaClock />
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <div>
              <h3>Approved</h3>
              <div className="summary-value">
                <span className="value">{approvedCount}</span>
              </div>
            </div>
            <div className="summary-icon approved-icon">
              <FaCheckCircle />
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <div>
              <h3>Rejected</h3>
              <div className="summary-value">
                <span className="value">{rejectedCount}</span>
              </div>
            </div>
            <div className="summary-icon rejected-icon">
              <FaTimes />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="leaves-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by employee name, department, or leave type..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            Approved
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="leaves-table-container">
        {error && (
          <div className="error-message" style={{ padding: '16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="no-results">
            <p>Loading leave requests...</p>
          </div>
        ) : (
          <>
            <table className="leaves-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Date Range</th>
                  <th>Reason</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar">{leave.employee.avatar}</div>
                        <div>
                          <div className="employee-name">{leave.employee.name}</div>
                          <div className="employee-dept">{leave.employee.department}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="leave-type-cell">
                        <div
                          className="leave-type-icon"
                          style={{ color: leave.leaveTypeColor }}
                        >
                          <leave.leaveTypeIcon />
                        </div>
                        <span>{leave.leaveType}</span>
                      </div>
                    </td>
                    <td>
                      <span className="duration-text">{leave.duration}</span>
                    </td>
                    <td>
                      <span className="days-badge">{leave.days} {leave.days === 1 ? 'day' : 'days'}</span>
                    </td>
                    <td>
                      <div className="date-range">
                        <FaCalendarAlt className="date-icon" />
                        <span>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="reason-text" title={leave.reason}>
                        {leave.reason}
                      </div>
                    </td>
                    <td>
                      <span className="applied-date">{formatDate(leave.appliedDate)}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(leave.status)}`}>
                        {getStatusText(leave.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {leave.status !== 'approved' && (
                          <button
                            className="action-btn approve-btn"
                            onClick={() => handleStatusChange(leave.id, 'approved')}
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                        )}
                        {leave.status !== 'pending' && (
                          <button
                            className="action-btn pending-btn"
                            onClick={() => handleStatusChange(leave.id, 'pending')}
                            title="Set as Pending"
                          >
                            <FaClock />
                          </button>
                        )}
                        {leave.status !== 'rejected' && (
                          <button
                            className="action-btn reject-btn"
                            onClick={() => handleStatusChange(leave.id, 'rejected')}
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLeaves.length === 0 && (
              <div className="no-results">
                <p>No leave requests found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const PayrollPage = () => (
  <div className="page-content">
    <h2>Payroll</h2>
    <p>Manage payroll and salary information.</p>
  </div>
);

const DocumentsPage = () => (
  <div className="page-content">
    <h2>Documents</h2>
    <p>Manage employee documents and files.</p>
  </div>
);

export default HRDashboard;


