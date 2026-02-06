import { supabase } from '../lib/supabase';

export const departmentService = {
  // Get all departments
  getAllDepartments: async () => {
    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        employees!departments_head_id_fkey (
          id,
          name,
          email,
          employee_id
        )
      `)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get department by ID
  getDepartmentById: async (id) => {
    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        employees!departments_head_id_fkey (
          id,
          name,
          email,
          employee_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create department
  createDepartment: async (departmentData) => {
    const { data, error } = await supabase
      .from('departments')
      .insert(departmentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update department
  updateDepartment: async (id, updates) => {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete department
  deleteDepartment: async (id) => {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

