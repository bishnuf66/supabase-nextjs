import { useState } from 'react';
import { Task } from '@/types';
import { TaskForm } from './TaskForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Edit, Trash2, Check, X } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { title: string; description: string; image?: File | null }) => Promise<void>;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export function TaskCard({ task, onDelete, onUpdate, isDeleting, isUpdating }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleUpdate = async (data: { title: string; description: string; image?: File | null }) => {
    await onUpdate(task.id, data);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (isConfirmingDelete) {
      console.log("Confirming delete for task:", task.id);
      onDelete(task.id);
      setIsConfirmingDelete(false);
    } else {
      console.log("First click - asking for confirmation");
      setIsConfirmingDelete(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => {
        setIsConfirmingDelete(false);
      }, 3000);
    }
  };

  if (isEditing) {
    return (
      <Card className="mb-4 border-l-4 border-l-indigo-500">
        <CardContent className="pt-6">
          <TaskForm
            initialData={{
              title: task.title,
              description: task.description || '',
              image_url: task.image_url || undefined,
            }}
            onSubmit={handleUpdate}
            isSubmitting={isUpdating}
            onCancel={() => setIsEditing(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            {task.description && (
              <p className="mt-1 text-gray-600 whitespace-pre-line">{task.description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-indigo-600"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${isConfirmingDelete ? 'text-red-600 bg-red-50' : 'text-gray-500'} hover:text-red-600`}
              onClick={handleDelete}
              disabled={isDeleting}
              title={isConfirmingDelete ? 'Click again to confirm delete' : 'Delete task'}
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
              ) : isConfirmingDelete ? (
                <Check className="h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isConfirmingDelete ? 'Confirm delete' : 'Delete'}
              </span>
            </Button>
          </div>
        </div>

        {task.image_url && (
          <div className="mt-4">
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src={task.image_url}
                alt={task.title}
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 px-6 py-3 text-xs text-gray-500">
        <span>
          Created on {new Date(task.created_at).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  );
}
