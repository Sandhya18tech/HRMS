import { useState, useEffect } from 'react';
import { FaTimes, FaBuilding, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { employeeService } from '../services/employeeService';
import './AddDepartmentModal.css';

const AddDepartmentModal = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    headId: ''
  });
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    // Reset form
    setFormData({
      name: '',
      location: '',
      headId: ''
    });
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      location: '',
      headId: ''
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content department-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Add New Department</h2>
            <p>Enter the details below to add a new department to the system.</p>
          </div>
          <button className="close-btn" onClick={handleCancel}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Department Name */}
            <div className="form-group">
              <label htmlFor="name">
                <FaBuilding className="label-icon" />
                Department Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Engineering, Marketing, Sales"
                required
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location">
                <FaMapMarkerAlt className="label-icon" />
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. New York HQ, London Office, Remote"
                required
              />
            </div>

            {/* Department Head */}
            <div className="form-group">
              <label htmlFor="headId">
                <FaUser className="label-icon" />
                Department Head (Optional)
              </label>
              <div className="select-wrapper">
                <select
                  id="headId"
                  name="headId"
                  value={formData.headId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Department Head</option>
                  {loadingEmployees ? (
                    <option disabled>Loading employees...</option>
                  ) : (
                    employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.designation || 'Employee'})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentModal;

