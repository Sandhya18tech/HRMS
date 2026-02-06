import { useState, useEffect, useRef } from 'react';
import { 
  FaTimes, 
  FaIdCard, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaBirthdayCake, 
  FaCalendar, 
  FaFilePdf, 
  FaDownload,
  FaBuilding,
  FaBriefcase,
  FaHome,
  FaUser,
  FaFileAlt,
  FaClock,
  FaPencilAlt,
  FaLinkedin,
  FaTwitter,
  FaCalendarAlt,
  FaChartLine,
  FaArrowRight,
  FaRibbon,
  FaSave,
  FaCheck,
  FaBan,
  FaPlay,
  FaStop,
  FaUmbrellaBeach
} from 'react-icons/fa';
import ApplyLeaveModal from './ApplyLeaveModal';
import './EmployeeDetailsModal.css';

const EmployeeDetailsModal = ({ employee, onClose, formatDate, calculateAge }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingSection, setEditingSection] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [checkInTime, setCheckInTime] = useState(null);
  const timerIntervalRef = useRef(null);
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);

  // Calculate service tenure
  const calculateTenure = (dateOfJoining) => {
    const today = new Date();
    const joinDate = new Date(dateOfJoining);
    let years = today.getFullYear() - joinDate.getFullYear();
    let months = today.getMonth() - joinDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months };
  };

  const tenure = calculateTenure(employee.dateOfJoining);
  const joinDateFormatted = formatDate(employee.dateOfJoining);
  const joinMonth = new Date(employee.dateOfJoining).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Mock data for additional fields
  const [employeeData, setEmployeeData] = useState({
    ...employee,
    legalName: employee.name === 'John Doe' ? 'Johnathan Doe' : employee.name,
    gender: 'Male',
    nationality: 'American',
    maritalStatus: 'Single',
    ssn: '***-**-8921',
    currentAddress: employee.address || '4521 Elm Street, Apt 4B, Brooklyn, NY 11201, United States',
    permanentAddress: 'Same as current residence',
    workLocation: 'New York HQ',
    workLocationDetail: 'Floor 4, Wing B',
    manager: {
      name: 'Sarah Smith',
      title: 'Director of Product',
      avatar: 'SS'
    },
    availableLeave: 14,
    totalLeave: 20,
    nextReview: '2024-10-15',
    employmentType: 'Full-Time Permanent',
    workSchedule: 'Mon-Fri (9:00 AM - 5:00 PM)'
  });

  const handleEdit = (section) => {
    setEditingSection(section);
    setEditedData({ ...employeeData });
  };

  const handleSave = () => {
    setEmployeeData({ ...editedData });
    setEditingSection(null);
    setEditedData({});
    // TODO: Save to database via API
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditedData({});
  };

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const daysUntilReview = Math.ceil((new Date(employeeData.nextReview) - new Date()) / (1000 * 60 * 60 * 24));

  // Check-in/Timer functionality
  useEffect(() => {
    if (isCheckedIn && checkInTime) {
      timerIntervalRef.current = setInterval(() => {
        const now = new Date();
        const diff = now - checkInTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimer({ hours, minutes, seconds });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isCheckedIn, checkInTime]);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    setCheckInTime(new Date());
    setTimer({ hours: 0, minutes: 0, seconds: 0 });
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setCheckInTime(null);
    setTimer({ hours: 0, minutes: 0, seconds: 0 });
    // TODO: Save attendance record to database
    alert(`Checked out. Total time: ${timer.hours}h ${timer.minutes}m ${timer.seconds}s`);
  };

  const formatTime = (num) => String(num).padStart(2, '0');

  const handleLeaveApplied = () => {
    // Refresh leave data if needed
    console.log('Leave application submitted successfully');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="employee-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Header Section */}
        <div className="employee-header">
          <div className="header-left">
            <div className="profile-picture-large">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="employee-info">
              <h1>{employee.name}</h1>
              <p className="employee-title">{employee.designation}</p>
              <div className="employee-meta">
                <div className="meta-item">
                  <FaBuilding className="meta-icon" />
                  <span>#{employee.employeeId}</span>
                </div>
                <div className="meta-item">
                  <FaBriefcase className="meta-icon" />
                  <span>{employee.department} Dept</span>
                </div>
                <div className="meta-item status-item">
                  <span className="status-dot green"></span>
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button className="btn-apply-leave" onClick={() => setIsApplyLeaveModalOpen(true)}>
              <FaUmbrellaBeach /> Apply Leave
            </button>
            <button className="btn-resume">
              <FaDownload /> Resume
            </button>
            <button className="btn-edit">
              <FaPencilAlt /> Edit Profile
            </button>
          </div>
        </div>

        {/* Check-in Section */}
        <div className="check-in-section">
          <div className="check-in-card">
            <div className="check-in-header">
              <FaClock className="check-in-icon" />
              <h3>Attendance</h3>
            </div>
            {!isCheckedIn ? (
              <div className="check-in-content">
                <p className="check-in-status">Not checked in</p>
                <button className="btn-check-in" onClick={handleCheckIn}>
                  <FaPlay /> Check In
                </button>
              </div>
            ) : (
              <div className="check-in-content">
                <div className="timer-display-checkin">
                  <div className="timer-unit-checkin">
                    <span className="timer-value-checkin">{formatTime(timer.hours)}</span>
                    <span className="timer-label-checkin">HRS</span>
                  </div>
                  <span className="timer-separator-checkin">:</span>
                  <div className="timer-unit-checkin">
                    <span className="timer-value-checkin">{formatTime(timer.minutes)}</span>
                    <span className="timer-label-checkin">MIN</span>
                  </div>
                  <span className="timer-separator-checkin">:</span>
                  <div className="timer-unit-checkin">
                    <span className="timer-value-checkin">{formatTime(timer.seconds)}</span>
                    <span className="timer-label-checkin">SEC</span>
                  </div>
                </div>
                <p className="check-in-status active">Checked in at {checkInTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                <button className="btn-check-out" onClick={handleCheckOut}>
                  <FaStop /> Check Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaHome /> Overview
          </button>
          <button 
            className={`nav-tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <FaUser /> Personal
          </button>
          <button 
            className={`nav-tab ${activeTab === 'employment' ? 'active' : ''}`}
            onClick={() => setActiveTab('employment')}
          >
            <FaBriefcase /> Employment
          </button>
          <button 
            className={`nav-tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FaFileAlt /> Documents
          </button>
          <button 
            className={`nav-tab ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <FaClock /> Time & Attendance
          </button>
        </div>

        {/* Content Area */}
        <div className="modal-content-area">
          {activeTab === 'overview' && (
            <div className="content-grid">
              {/* Contact Information Card - Left Column Top */}
              <div className="info-card contact-card">
                <div className="card-header">
                  <h3>Contact Information</h3>
                  {editingSection === 'contact' ? (
                    <div className="edit-actions">
                      <button className="save-btn" onClick={handleSave}>
                        <FaCheck /> Save
                      </button>
                      <button className="cancel-btn" onClick={handleCancel}>
                        <FaBan /> Cancel
                      </button>
                    </div>
                  ) : (
                    <button className="edit-icon-btn" onClick={() => handleEdit('contact')}>
                      <FaPencilAlt />
                    </button>
                  )}
                </div>
                <div className="card-body">
                  <div className="contact-item">
                    <FaEnvelope className="contact-icon" />
                    <div className="contact-details">
                      <div className="contact-label">EMAIL ADDRESS</div>
                      {editingSection === 'contact' ? (
                        <input
                          type="email"
                          className="editable-input"
                          value={editedData.email || employee.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                        />
                      ) : (
                        <div className="contact-value">{employeeData.email || employee.email}</div>
                      )}
                    </div>
                  </div>
                  <div className="contact-item">
                    <FaPhone className="contact-icon" />
                    <div className="contact-details">
                      <div className="contact-label">PHONE NUMBER</div>
                      {editingSection === 'contact' ? (
                        <input
                          type="tel"
                          className="editable-input"
                          value={editedData.phone || employee.phone || ''}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                        />
                      ) : (
                        <div className="contact-value">{employeeData.phone || employee.phone || 'N/A'}</div>
                      )}
                    </div>
                  </div>
                  <div className="contact-item">
                    <FaMapMarkerAlt className="contact-icon" />
                    <div className="contact-details">
                      <div className="contact-label">WORK LOCATION</div>
                      {editingSection === 'contact' ? (
                        <div className="location-inputs">
                          <input
                            type="text"
                            className="editable-input"
                            placeholder="Location"
                            value={editedData.workLocation || employeeData.workLocation}
                            onChange={(e) => handleFieldChange('workLocation', e.target.value)}
                          />
                          <input
                            type="text"
                            className="editable-input"
                            placeholder="Detail"
                            value={editedData.workLocationDetail || employeeData.workLocationDetail}
                            onChange={(e) => handleFieldChange('workLocationDetail', e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="contact-value">{employeeData.workLocation}, {employeeData.workLocationDetail}</div>
                      )}
                    </div>
                  </div>
                  <div className="social-buttons">
                    <button className="social-btn linkedin">
                      <FaLinkedin /> LinkedIn
                    </button>
                    <button className="social-btn twitter">
                      <FaTwitter /> Twitter
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Metrics Cards - Right Column Top */}
              <div className="metrics-container">
                <div className="metric-card-small">
                  <div className="metric-header">
                    <FaCalendarAlt className="metric-icon" />
                    <span className="metric-badge">ANNUAL</span>
                  </div>
                  <div className="metric-title">Available Leave</div>
                  <div className="metric-value-large">{employeeData.availableLeave} Days</div>
                  <div className="metric-progress">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${(employeeData.availableLeave / employeeData.totalLeave) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="metric-card-small">
                  <div className="metric-header">
                    <FaRibbon className="metric-icon" />
                  </div>
                  <div className="metric-title">Service Tenure</div>
                  <div className="metric-value-large">{tenure.years}y {tenure.months}m</div>
                  <div className="metric-footer">
                    <FaChartLine className="footer-icon" />
                    <span>Joined {joinMonth}</span>
                  </div>
                </div>

                <div className="metric-card-small">
                  <div className="metric-header">
                    <FaFileAlt className="metric-icon orange" />
                    <span className="metric-badge orange">UPCOMING</span>
                  </div>
                  <div className="metric-title">Next Review</div>
                  <div className="metric-value-large">{formatDate(employeeData.nextReview).split(',')[0]}</div>
                  <div className="metric-footer">
                    <span className="days-left">▲ {daysUntilReview} days left</span>
                  </div>
                </div>
              </div>

              {/* Reporting To Card - Left Column Bottom */}
              <div className="info-card reporting-card">
                <div className="card-header">
                  <h3>Reporting To</h3>
                </div>
                <div className="card-body">
                  <div className="reporting-item">
                    <div className="manager-avatar">{employeeData.manager.avatar}</div>
                    <div className="manager-info">
                      <div className="manager-name">{employeeData.manager.name}</div>
                      <div className="manager-title">{employeeData.manager.title}</div>
                    </div>
                    <FaArrowRight className="arrow-icon" />
                  </div>
                </div>
              </div>

            
              <div className="info-card employment-card">
                <div className="card-header">
                  <h3>Employment Information</h3>
                  {editingSection === 'employment' ? (
                    <div className="edit-actions">
                      <button className="save-btn" onClick={handleSave}>
                        <FaCheck /> Save
                      </button>
                      <button className="cancel-btn" onClick={handleCancel}>
                        <FaBan /> Cancel
                      </button>
                    </div>
                  ) : (
                    <button className="edit-link-btn" onClick={() => handleEdit('employment')}>
                      <FaPencilAlt /> Edit
                    </button>
                  )}
                </div>
                <div className="card-body">
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="info-label">DATE JOINED</span>
                      {editingSection === 'employment' ? (
                        <input
                          type="date"
                          className="editable-input"
                          value={editedData.date_of_joining || employee.dateOfJoining || employee.date_of_joining || ''}
                          onChange={(e) => handleFieldChange('date_of_joining', e.target.value)}
                        />
                      ) : (
                        <span className="info-value">{joinDateFormatted}</span>
                      )}
                    </div>
                    <div className="info-row">
                      <span className="info-label">DEPARTMENT</span>
                      {editingSection === 'employment' ? (
                        <select
                          className="editable-select"
                          value={editedData.department || employee.department}
                          onChange={(e) => handleFieldChange('department', e.target.value)}
                        >
                          <option value="Engineering">Engineering</option>
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                          <option value="HR">HR</option>
                          <option value="Operations">Operations</option>
                          <option value="Finance">Finance</option>
                        </select>
                      ) : (
                        <span className="info-value">
                          <span className="dept-dot"></span>
                          {employee.department}
                        </span>
                      )}
                    </div>
                    <div className="info-row">
                      <span className="info-label">EMPLOYMENT TYPE</span>
                      {editingSection === 'employment' ? (
                        <select
                          className="editable-select"
                          value={editedData.employmentType || employeeData.employmentType}
                          onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                        >
                          <option value="Full-Time Permanent">Full-Time Permanent</option>
                          <option value="Part-Time">Part-Time</option>
                          <option value="Contract">Contract</option>
                          <option value="Intern">Intern</option>
                        </select>
                      ) : (
                        <span className="info-value">{employeeData.employmentType}</span>
                      )}
                    </div>
                    <div className="info-row">
                      <span className="info-label">WORK SCHEDULE</span>
                      {editingSection === 'employment' ? (
                        <input
                          type="text"
                          className="editable-input"
                          value={editedData.workSchedule || employeeData.workSchedule}
                          onChange={(e) => handleFieldChange('workSchedule', e.target.value)}
                        />
                      ) : (
                        <span className="info-value">{employeeData.workSchedule}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="info-section">
              {/* PERSONAL INFORMATION CARD */}
              <div className="info-card personal-card">
                <div className="card-header">
                  <h3>Personal Information</h3>
                  {editingSection === 'personal' ? (
                    <div className="edit-actions">
                      <button className="save-btn" onClick={handleSave}>
                        <FaCheck /> Save
                      </button>
                      <button className="cancel-btn" onClick={handleCancel}>
                        <FaBan /> Cancel
                      </button>
                    </div>
                  ) : (
                    <button className="edit-link-btn" onClick={() => handleEdit('personal')}>
                      <FaPencilAlt /> Edit
                    </button>
                  )}
                </div>

                <div className="card-body">
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="info-label">FULL LEGAL NAME</span>
                      {editingSection === 'personal' ? (
                        <input
                          type="text"
                          className="editable-input"
                          value={editedData.legalName || employeeData.legalName}
                          onChange={(e) => handleFieldChange('legalName', e.target.value)}
                        />
                      ) : (
                        <span className="info-value">{employeeData.legalName}</span>
                      )}
                    </div>

                    <div className="info-row">
                      <span className="info-label">DATE OF BIRTH</span>
                      {editingSection === 'personal' ? (
                        <input
                          type="date"
                          className="editable-input"
                          value={editedData.dob || employee.dob || ''}
                          onChange={(e) => handleFieldChange('dob', e.target.value)}
                        />
                      ) : (
                        <span className="info-value">{employeeData.dob ? formatDate(employeeData.dob) : 'N/A'}</span>
                      )}
                    </div>

                    <div className="info-row">
                      <span className="info-label">GENDER</span>
                      {editingSection === 'personal' ? (
                        <select
                          className="editable-select"
                          value={editedData.gender || employeeData.gender}
                          onChange={(e) => handleFieldChange('gender', e.target.value)}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <span className="info-value">{employeeData.gender}</span>
                      )}
                    </div>

                    <div className="info-row">
                      <span className="info-label">NATIONALITY</span>
                      {editingSection === 'personal' ? (
                        <input
                          type="text"
                          className="editable-input"
                          value={editedData.nationality || employeeData.nationality}
                          onChange={(e) => handleFieldChange('nationality', e.target.value)}
                        />
                      ) : (
                        <span className="info-value">{employeeData.nationality}</span>
                      )}
                    </div>

                    <div className="info-row">
                      <span className="info-label">MARITAL STATUS</span>
                      {editingSection === 'personal' ? (
                        <select
                          className="editable-select"
                          value={editedData.maritalStatus || employeeData.maritalStatus}
                          onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
                        >
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      ) : (
                        <span className="info-value">{employeeData.maritalStatus}</span>
                      )}
                    </div>

                    <div className="info-row">
                      <span className="info-label">SSN / GOV ID</span>
                      {editingSection === 'personal' ? (
                        <input
                          type="text"
                          className="editable-input"
                          value={editedData.ssn || employeeData.ssn}
                          onChange={(e) => handleFieldChange('ssn', e.target.value)}
                        />
                      ) : (
                        <span className="info-value">{employeeData.ssn}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ADDRESS DETAILS CARD */}
              <div className="info-card address-card">
                <div className="card-header">
                  <h3>Address Details</h3>
                  {editingSection === 'address' ? (
                    <div className="edit-actions">
                      <button className="save-btn" onClick={handleSave}>
                        <FaCheck /> Save
                      </button>
                      <button className="cancel-btn" onClick={handleCancel}>
                        <FaBan /> Cancel
                      </button>
                    </div>
                  ) : (
                    <button className="edit-link-btn" onClick={() => handleEdit('address')}>
                      <FaPencilAlt /> Edit
                    </button>
                  )}
                </div>

                <div className="card-body">
                  <div className="address-section">
                    <div className="address-label">CURRENT RESIDENCE</div>
                    {editingSection === 'address' ? (
                      <textarea
                        className="editable-textarea"
                        value={editedData.currentAddress || employeeData.currentAddress}
                        onChange={(e) => handleFieldChange('currentAddress', e.target.value)}
                        rows="2"
                      />
                    ) : (
                      <div className="address-value">
                        {employeeData.currentAddress}
                      </div>
                    )}
                  </div>

                  <div className="address-section">
                    <div className="address-label">PERMANENT ADDRESS</div>
                    {editingSection === 'address' ? (
                      <textarea
                        className="editable-textarea"
                        value={editedData.permanentAddress || employeeData.permanentAddress}
                        onChange={(e) => handleFieldChange('permanentAddress', e.target.value)}
                        rows="2"
                      />
                    ) : (
                      <div className="address-value muted">
                        {employeeData.permanentAddress}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'employment' && (
            <div className="tab-content">
              <p>Employment information details...</p>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="tab-content">
              <div className="documents-list">
                {employee.documents.map((doc, index) => (
                  <div key={index} className="document-item">
                    <div className="document-icon">
                      <FaFilePdf />
                    </div>
                    <div className="document-info">
                      <div className="document-name">{doc.name}</div>
                      <div className="document-type">{doc.type}</div>
                    </div>
                    <button className="download-btn">
                      <FaDownload />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="tab-content">
              <p>Time & Attendance details...</p>
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isApplyLeaveModalOpen && (
        <ApplyLeaveModal
          isOpen={isApplyLeaveModalOpen}
          onClose={() => setIsApplyLeaveModalOpen(false)}
          employee={employee}
          onSuccess={handleLeaveApplied}
        />
      )}
    </div>
  );
};

export default EmployeeDetailsModal;
