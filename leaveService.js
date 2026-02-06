import { supabase } from '../lib/supabase';

export const leaveService = {
  // Get all leave requests
  getAllLeaves: async () => {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employees!leave_requests_employee_id_fkey (
          id,
          name,
          department,
          employee_id
        )
      `)
      .order('applied_on', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get leave requests by employee ID
  getLeavesByEmployeeId: async (employeeId) => {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', employeeId)
      .order('applied_on', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create leave request
  createLeaveRequest: async (leaveData) => {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert(leaveData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update leave status
  updateLeaveStatus: async (leaveId, status, reviewedBy) => {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', leaveId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete leave request
  deleteLeaveRequest: async (leaveId) => {
    const { error } = await supabase
      .from('leave_requests')
      .delete()
      .eq('id', leaveId);

    if (error) throw error;
  },
};

