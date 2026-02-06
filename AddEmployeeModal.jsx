import { useState } from 'react';
import { FaTimes, FaEnvelope, FaCalendarAlt, FaPencilAlt, FaUpload } from 'react-icons/fa';
import './AddEmployeeModal.css';

const AddEmployeeModal = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    designation: '',
    phoneNumber: '',
    dateOfJoining: '',
    systemRole: 'Employee',
    accountStatus: true,
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      designation: '',
      phoneNumber: '',
      dateOfJoining: '',
      systemRole: 'Employee',
      accountStatus: true,
      photo: null
    });
    setPhotoPreview(null);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      designation: '',
      phoneNumber: '',
      dateOfJoining: '',
      systemRole: 'Employee',
      accountStatus: true,
      photo: null
    });
    setPhotoPreview(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Add New Employee</h2>
            <p>Enter the details below to add a new employee to the system.</p>
          </div>
          <button className="close-btn" onClick={handleCancel}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Left Side - Photo Upload */}
            <div className="photo-section">
              <div className="photo-upload-container">
                <div className="photo-placeholder">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="photo-preview" />
                  ) : (
                    <FaUpload className="upload-icon" />
                  )}
                  <label className="photo-edit-btn">
                    <FaPencilAlt />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <label className="upload-text">Upload Photo</label>
              </div>
            </div>

            {/* Right Side - Form Fields */}
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. Sarah"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Connor"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-with-icon">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="sarah.connor@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <div className="select-wrapper">
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Software Development">Software Development</option>
                      <option value="Portfolio Management">Portfolio Management</option>
                      <option value="Digital Marketing">DigitalMarketing</option>
                      
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="designation">Designation</label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Product Designer"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+91 88888 88888"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfJoining">Date of Joining</label>
                  <div className="input-with-icon">
                    <input
                      type="date"
                      id="dateOfJoining"
                      name="dateOfJoining"
                      value={formData.dateOfJoining}
                      onChange={handleInputChange}
                      required
                    />
                    <FaCalendarAlt className="input-icon-right" />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="systemRole">System Role</label>
                  <div className="select-wrapper">
                    <select
                      id="systemRole"
                      name="systemRole"
                      value={formData.systemRole}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Employee">Employee</option>
                      <option value="HR">HR</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="accountStatus">Account Status</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="accountStatus"
                      name="accountStatus"
                      checked={formData.accountStatus}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="accountStatus" className="toggle-label">
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">
                        {formData.accountStatus ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;

