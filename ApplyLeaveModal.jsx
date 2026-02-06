import { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { leaveService } from '../services/leaveService';
import './ApplyLeaveModal.css';

const ApplyLeaveModal = ({ isOpen, onClose, employee, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [calculatedDays, setCalculatedDays] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
      setError(null);
      setCalculatedDays(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        setCalculatedDays(diffDays);
      } else {
        setCalculatedDays(0);
      }
    } else {
      setCalculatedDays(0);
    }
  }, [formData.startDate, formData.endDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation with clear error messages
    if (!formData.leaveType) {
      setError('⚠️ Please select a leave type from the dropdown');
      return;
    }
    if (!formData.startDate) {
      setError('⚠️ Please select a start date for your leave');
      return;
    }
    if (!formData.endDate) {
      setError('⚠️ Please select an end date for your leave');
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('⚠️ End date cannot be before start date. Please select a valid date range');
      return;
    }
    if (!formData.reason.trim()) {
      setError('⚠️ Please provide a reason for your leave request');
      return;
    }

    try {
      setIsSubmitting(true);

      // Validate: Check if employee.profile_id matches logged-in user's ID (if profile_id exists)
      if (employee.profile_id && user?.id && employee.profile_id !== user.id) {
        setError('⚠️ Employee record does not match your account. Please contact HR.');
        setIsSubmitting(false);
        return;
      }

      // Create leave request
      const leavePayload = {
        employee_id: employee.id,
        leave_type: formData.leaveType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        duration: calculatedDays,
        reason: formData.reason.trim(),
        status: 'Pending'
      };

      await leaveService.createLeaveRequest(leavePayload);

      // Show success message
      alert('Leave application submitted successfully! HR will be notified.');

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (err) {
      console.error('Error submitting leave request:', err);
      
      // More descriptive error messages
      let errorMessage = 'Failed to submit leave request. Please try again.';
      
      if (err.message) {
        if (err.message.includes('permission') || err.message.includes('policy')) {
          errorMessage = '⚠️ Permission denied. Please contact HR if you continue to see this error.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = '⚠️ Network error. Please check your internet connection and try again.';
        } else if (err.message.includes('duplicate') || err.message.includes('unique')) {
          errorMessage = '⚠️ A leave request for this period already exists. Please check your existing requests.';
        } else {
          errorMessage = `⚠️ ${err.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
    setError(null);
    setCalculatedDays(0);
    onClose();
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay-leave" onClick={handleCancel}>
      <div className="apply-leave-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn-leave" onClick={handleCancel}>
          <FaTimes />
        </button>

        <div className="leave-modal-header">
          <h2>Apply for Leave</h2>
          <p>Fill in the details below to submit your leave request</p>
        </div>

        <form onSubmit={handleSubmit} className="leave-form">
          {error && (
            <div className="error-message-leave">
              {error}
            </div>
          )}

          <div className="form-group-leave">
            <label htmlFor="leaveType">
              <FaFileAlt className="label-icon" />
              Leave Type <span className="required">*</span>
            </label>
            <select
              id="leaveType"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleInputChange}
              required
              className="leave-select"
            >
              <option value="">Select Leave Type</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Privilege Leave">Privilege Leave</option>
              <option value="Vacation">Vacation</option>
              <option value="Personal Leave">Personal Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
          </div>

          <div className="date-row">
            <div className="form-group-leave">
              <label htmlFor="startDate">
                <FaCalendarAlt className="label-icon" />
                Start Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={today}
                required
                className="leave-input"
              />
            </div>

            <div className="form-group-leave">
              <label htmlFor="endDate">
                <FaCalendarAlt className="label-icon" />
                End Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || today}
                required
                className="leave-input"
              />
            </div>
          </div>

          {calculatedDays > 0 && (
            <div className="days-display">
              <span className="days-label">Total Days:</span>
              <span className="days-value">{calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}</span>
            </div>
          )}

          <div className="form-group-leave">
            <label htmlFor="reason">
              <FaFileAlt className="label-icon" />
              Reason <span className="required">*</span>
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Please provide a reason for your leave request..."
              rows="4"
              required
              className="leave-textarea"
            />
          </div>

          <div className="leave-modal-footer">
            <button
              type="button"
              className="btn-cancel-leave"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit-leave"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;

