import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Task, TaskFormData } from '@/types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (taskData: TaskFormData) => {
    try {
      setLoading(true);
      let imageUrl = null;
      let imagePath = null;

      if (taskData.image) {
        const fileExt = taskData.image.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tasks-images')
          .upload(fileName, taskData.image);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('tasks-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
        imagePath = fileName;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            title: taskData.title,
            description: taskData.description,
            image_url: imageUrl,
            image_path: imagePath,
            email: (await supabase.auth.getSession()).data.session?.user?.email
          }
        ])
        .select();

      if (error) throw error;
      
      await fetchTasks();
      return data[0];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setLoading(true);
      
      // First get the task to get the image path
      const { data: taskToDelete, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete the image if it exists
      if (taskToDelete?.image_path) {
        const { error: deleteImageError } = await supabase.storage
          .from('tasks-images')
          .remove([taskToDelete.image_path]);

        if (deleteImageError) {
          console.error('Error deleting image:', deleteImageError);
          // Continue with task deletion even if image deletion fails
        }
      }

      // Delete the task
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      // Update the local state
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    deleteTask,
    refreshTasks: fetchTasks,
  };
};
