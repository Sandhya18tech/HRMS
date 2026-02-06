import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ApplyLeaveModal from './ApplyLeaveModal';
import { 
  FaChartBar, 
  FaUser, 
  FaClock,
  FaCalendarAlt,
  FaDollarSign, 
  FaSignOutAlt, 
  FaBell,
  FaCog,
  FaFileAlt,
  FaSearch,
  FaUmbrellaBeach,
  FaHeartbeat,
  FaStar,
  FaEye,
  FaDownload,
  FaArrowRight,
  FaArrowLeft,
  FaUpload,
  FaFilePdf
} from 'react-icons/fa';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname.split('/').pop() || 'dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartBar, path: '/employee/dashboard' },
    { id: 'profile', label: 'My Profile', icon: FaUser, path: '/employee/profile' },
    { id: 'attendance', label: 'Attendance', icon: FaClock, path: '/employee/attendance' },
    { id: 'payslips', label: 'Payslips', icon: FaDollarSign, path: '/employee/payslips' },
    { id: 'documents', label: 'Documents', icon: FaFileAlt, path: '/employee/documents' },
  ];

  const handleMenuClick = (item) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  return (
    <div className="employee-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="sidebar-title">
              <h2>HR Portal</h2>
              <p>Employee Panel</p>
            </div>
          </div>
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
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item logout" onClick={handleLogout}>
            <span className="nav-icon"><FaArrowLeft /></span>
            <span className="nav-label">Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Dashboard</h1>
          </div>
          <div className="header-center">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search..." />
            </div>
          </div>
          <div className="header-right">
            <span className="header-icon"><FaBell /></span>
            <span className="header-icon"><FaCog /></span>
            <div className="user-profile">
              <div className="profile-avatar">{user?.name?.charAt(0) || 'U'}</div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {activeTab === 'dashboard' && <EmployeeDashboardOverview user={user} />}
          {activeTab === 'profile' && <MyProfilePage user={user} />}
          {activeTab === 'attendance' && <EmployeeAttendancePage user={user} />}
          {activeTab === 'leaves' && <EmployeeLeavesPage user={user} />}
          {activeTab === 'payslips' && <PayslipsPage user={user} />}
          {activeTab === 'documents' && <DocumentsPage user={user} />}
        </div>
      </div>
    </div>
  );
};

// Employee Dashboard Overview
const EmployeeDashboardOverview = ({ user }) => {
  const [time, setTime] = useState({ hours: 9, minutes: 41, seconds: 5 });
  const [showAmount, setShowAmount] = useState(false);
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [leaveModalError, setLeaveModalError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        let newSeconds = prev.seconds + 1;
        let newMinutes = prev.minutes;
        let newHours = prev.hours;

        if (newSeconds >= 60) {
          newSeconds = 0;
          newMinutes += 1;
        }
        if (newMinutes >= 60) {
          newMinutes = 0;
          newHours += 1;
        }
        if (newHours >= 24) {
          newHours = 0;
        }

        return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (num) => String(num).padStart(2, '0');

  // Open leave modal - fetch employee by email and validate profile_id
  const handleOpenLeaveModal = async (e) => {
    e.preventDefault();
    setLeaveModalError(null);

    if (!user?.email) {
      setLeaveModalError('⚠️ Your email address is not available. Please contact HR.');
      return;
    }

    if (!user?.id) {
      setLeaveModalError('⚠️ Your user ID is not available. Please log out and log in again.');
      return;
    }

    try {
      setLoadingEmployee(true);
      // Get employee by logged-in user's email
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error || !data) {
        console.error('Error fetching employee:', error);
        setLeaveModalError('⚠️ Employee record not found. Please contact HR to add your employee details.');
        return;
      }

      // Validate: Check if employee.profile_id matches logged-in user's ID
      if (data.profile_id && data.profile_id !== user.id) {
        console.error('Profile ID mismatch:', { employeeProfileId: data.profile_id, userId: user.id });
        setLeaveModalError('⚠️ Employee record does not match your account. Please contact HR.');
        return;
      }

      // If profile_id is null, that's okay (employee not linked yet)
      // But we can still allow leave application

      // Transform data for modal
      const transformedData = {
        ...data,
        employeeId: data.employee_id,
        dateOfJoining: data.date_of_joining,
        documents: data.documents || []
      };

      setEmployeeData(transformedData);
      setLeaveModalError(null); // Clear any previous errors
      setIsApplyLeaveModalOpen(true);
    } catch (err) {
      console.error('Error:', err);
      setLeaveModalError('⚠️ An error occurred while loading your employee data. Please try again or contact HR.');
    } finally {
      setLoadingEmployee(false);
    }
  };

  const handleLeaveApplied = () => {
    // Refresh leave data if needed
    console.log('Leave application submitted successfully');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentDate = () => {
    const date = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div className="employee-overview">
      {/* Greeting Section */}
      <div className="greeting-section">
        <h2 className="greeting">{getGreeting()}, {user?.name?.split(' ')[0] || 'Alex'}</h2>
        <p className="current-date">{getCurrentDate()}</p>
      </div>

      {/* Dashboard Widgets */}
      <div className="dashboard-widgets">
        {/* Attendance Widget */}
        <div className="widget attendance-widget">
          <div className="widget-header">
            <h3><FaClock className="widget-icon" /> Attendance</h3>
          </div>
          <div className="attendance-content">
            <p className="shift-time">Shift: 09:00 AM - 06:00 PM</p>
            <div className="timer-display">
              <div className="timer-unit">
                <span className="timer-value">{formatTime(time.hours)}</span>
                <span className="timer-label">HRS</span>
              </div>
              <span className="timer-separator">:</span>
              <div className="timer-unit">
                <span className="timer-value">{formatTime(time.minutes)}</span>
                <span className="timer-label">MIN</span>
              </div>
              <span className="timer-separator">:</span>
              <div className="timer-unit">
                <span className="timer-value">{formatTime(time.seconds)}</span>
                <span className="timer-label">SEC</span>
              </div>
            </div>
            <p className="clock-status">You are currently clocked in.</p>
            <button className="checkout-btn">
              <FaArrowRight /> Check Out
            </button>
            <div className="clock-in-info">
              <span>Clock In: 09:00 AM</span>
              <span className="on-time-badge">On Time</span>
            </div>
          </div>
        </div>

        {/* Leave Balance Widget */}
        <div className="widget leave-balance-widget">
          <div className="widget-header">
            <h3>Leave Balance</h3>
            <button 
              className="apply-leave-link" 
              onClick={handleOpenLeaveModal}
              disabled={loadingEmployee}
            >
              {loadingEmployee ? 'Loading...' : 'Apply Leave'}
            </button>
          </div>
          {leaveModalError && (
            <div style={{
              margin: '12px 16px',
              padding: '12px 16px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              fontSize: '14px',
              border: '1px solid #fecaca'
            }}>
              {leaveModalError}
            </div>
          )}
          <div className="leave-cards">
            <div className="leave-card casual">
              <div className="leave-icon"><FaUmbrellaBeach /></div>
              <div className="leave-info">
                <div className="leave-type">Casual Leave</div>
                <div className="leave-count">5 <span>Available out of 12</span></div>
                <div className="leave-progress">
                  <div className="progress-bar blue" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
            <div className="leave-card sick">
              <div className="leave-icon"><FaHeartbeat /></div>
              <div className="leave-info">
                <div className="leave-type">Sick Leave</div>
                <div className="leave-count">8 <span>Available out of 10</span></div>
                <div className="leave-progress">
                  <div className="progress-bar purple" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
            <div className="leave-card privilege">
              <div className="leave-icon"><FaStar /></div>
              <div className="leave-info">
                <div className="leave-type">Privilege Leave</div>
                <div className="leave-count">12 <span>Available out of 20</span></div>
                <div className="leave-progress">
                  <div className="progress-bar orange" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Payslip Widget */}
        <div className="widget payslip-widget">
          <div className="widget-header">
            <div>
              <h3>Recent Payslip</h3>
              <p className="payslip-month">September 2023</p>
            </div>
            <FaDollarSign className="payslip-icon" />
          </div>
          <div className="payslip-content">
            <div className="payslip-row">
              <span className="payslip-label">NET PAY</span>
              <div className="payslip-amount">
                {showAmount ? (
                  <span>$4,250.00</span>
                ) : (
                  <span className="blurred">$4,250.00</span>
                )}
                <FaEye className="eye-icon" onClick={() => setShowAmount(!showAmount)} />
              </div>
            </div>
            <div className="payslip-row">
              <span className="payslip-label">PAID ON</span>
              <span className="payslip-date">Oct 01, 2023</span>
            </div>
            <button className="download-btn">
              <FaDownload /> Download PDF
            </button>
          </div>
        </div>

        {/* Upcoming Holidays Widget */}
        <div className="widget holidays-widget">
          <div className="widget-header">
            <h3>Upcoming Holidays</h3>
          </div>
          <div className="holidays-list">
            <div className="holiday-item">
              <div className="holiday-date blue">NOV 12</div>
              <div className="holiday-details">
                <div className="holiday-name">Diwali Festival</div>
                <div className="holiday-type">Optional Holiday</div>
              </div>
              <div className="holiday-day">MON</div>
            </div>
            <div className="holiday-item">
              <div className="holiday-date red">DEC 25</div>
              <div className="holiday-details">
                <div className="holiday-name">Christmas Day</div>
                <div className="holiday-type">Public Holiday</div>
              </div>
              <div className="holiday-day">WED</div>
            </div>
          </div>
          <a href="#" className="view-calendar-link">View Calendar <FaArrowRight /></a>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isApplyLeaveModalOpen && employeeData && (
        <ApplyLeaveModal
          isOpen={isApplyLeaveModalOpen}
          onClose={() => {
            setIsApplyLeaveModalOpen(false);
            setEmployeeData(null);
          }}
          employee={employeeData}
          onSuccess={handleLeaveApplied}
        />
      )}
    </div>
  );
};

// Placeholder components for employee pages
const MyProfilePage = ({ user }) => (
  <div className="page-content">
    <h2>My Profile</h2>
    <div className="profile-details">
      <div className="detail-row">
        <span className="detail-label">Name:</span>
        <span className="detail-value">{user?.name || 'N/A'}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Email:</span>
        <span className="detail-value">{user?.email || 'N/A'}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Employee ID:</span>
        <span className="detail-value">{user?.employeeid || 'N/A'}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Department:</span>
        <span className="detail-value">{user?.department || 'N/A'}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Position:</span>
        <span className="detail-value">{user?.position || 'N/A'}</span>
      </div>
      
    </div>
  </div>
);

const EmployeeAttendancePage = ({ user }) => (
  <div className="page-content">
    <h2>My Attendance</h2>
    <p>View your attendance records and history.</p>
  </div>
);

const EmployeeLeavesPage = ({ user }) => (
  <div className="page-content">
    <h2>My Leaves</h2>
    <p>View and manage your leave requests.</p>
  </div>
);

const PayslipsPage = ({ user }) => (
  <div className="page-content">
    <h2>My Payslips</h2>
    <p>View and download your payslips.</p>
  </div>
);

// Document types with keys for upload state
const DOCUMENT_TYPES = [
  { key: 'aadhaar', label: 'Aadhaar Card', required: true },
  { key: 'pan', label: 'PAN Card', required: true },
  { key: 'tenth_marksheet', label: '10th Marksheet', required: true },
  { key: 'twelfth_marksheet', label: '12th Marksheet', required: true },
  { key: 'address_proof', label: 'Address Proof', required: true },
  { key: 'previous_payslip', label: 'Previous Company Payment Slip (if you have experience)', required: false },
  { key: 'bank_passbook', label: 'Bank Passbook Photo Copy', required: true },
];

const DocumentsPage = ({ user }) => {
  const [uploads, setUploads] = useState({});
  const [uploading, setUploading] = useState(null);

  const handleFileChange = (docKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(docKey);
    // Simulate upload delay; replace with actual Supabase storage upload when backend is ready
    setTimeout(() => {
      setUploads((prev) => ({
        ...prev,
        [docKey]: { name: file.name, size: file.size, uploadedAt: new Date().toISOString() },
      }));
      setUploading(null);
    }, 600);
  };

  const removeFile = (docKey) => {
    setUploads((prev) => {
      const next = { ...prev };
      delete next[docKey];
      return next;
    });
  };

  return (
    <div className="page-content documents-page">
      <h2>My Documents</h2>
      <p className="documents-intro">Upload and manage your documents. Accepted formats: PDF, JPG, PNG (max 5MB per file).</p>

      <div className="documents-grid">
        {DOCUMENT_TYPES.map(({ key, label, required }) => (
          <div key={key} className="document-card">
            <div className="document-card-header">
              <span className="document-label">{label}</span>
              {required && <span className="document-required">Required</span>}
            </div>
            <div className="document-upload-zone">
              {uploads[key] ? (
                <div className="document-uploaded">
                  <FaFilePdf className="doc-icon" />
                  <div className="document-uploaded-info">
                    <span className="document-filename">{uploads[key].name}</span>
                    <span className="document-filesize">
                      {(uploads[key].size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button
                    type="button"
                    className="document-remove-btn"
                    onClick={() => removeFile(key)}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="document-upload-label">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(key, e)}
                    disabled={uploading === key}
                  />
                  {uploading === key ? (
                    <span className="upload-placeholder">Uploading...</span>
                  ) : (
                    <>
                      <FaUpload className="upload-icon" />
                      <span className="upload-placeholder">Click to upload</span>
                      <span className="upload-hint">PDF, JPG or PNG</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeDashboard;

