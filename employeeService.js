import { supabase } from '../lib/supabase';

export const employeeService = {
  // Get all employees
  getAllEmployees: async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get employee by ID
  getEmployeeById: async (id) => {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        documents (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update employee
  updateEmployee: async (id, updates) => {
    const { data, error } = await supabase
      .from('employees')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete employee
  deleteEmployee: async (id) => {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Search employees
  searchEmployees: async (searchTerm, filters = {}) => {
    let query = supabase
      .from('employees')
      .select('*');

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%`);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.department && filters.department !== 'all') {
      query = query.eq('department', filters.department);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

