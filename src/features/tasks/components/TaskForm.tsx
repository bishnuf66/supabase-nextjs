import { useState, useRef, ChangeEvent } from 'react';
import { TaskFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon, Plus } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: Partial<TaskFormData>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function TaskForm({
  onSubmit,
  initialData = { title: '', description: '' },
  isSubmitting = false,
  onCancel,
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    image: initialData.image || null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log("File selected:", file);
    setFormData(prev => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data being submitted:", formData);
    console.log("Image file:", formData.image);
    await onSubmit(formData);
    if (!initialData.title) {
      // Only reset if it's a new task form
      setFormData({
        title: '',
        description: '',
        image: null,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
          required
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description"
          rows={3}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image
        </label>
        <div className="mt-1 flex items-center">
          <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <div className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              {formData.image ? 'Change Image' : 'Upload Image'}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
          {formData.image && (
            <span className="ml-3 text-sm text-gray-500">
              {formData.image.name}
            </span>
          )}
        </div>
        {initialData.image_url && !formData.image && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Current image:</p>
            <img
              src={initialData.image_url}
              alt="Task"
              className="mt-1 h-20 w-auto object-cover rounded"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            'Saving...'
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {initialData.title ? 'Update Task' : 'Add Task'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
