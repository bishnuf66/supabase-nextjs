import { useState } from 'react';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface TasksListProps {
  tasks: Task[];
  onCreate: (data: { title: string; description: string; image?: File | null }) => Promise<void>;
  onUpdate: (id: string, data: { title: string; description: string; image?: File | null }) => Promise<void>;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function TasksList({
  tasks,
  onCreate,
  onUpdate,
  onDelete,
  isLoading = false,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
}: TasksListProps) {
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
        <Button onClick={() => setIsCreatingTask(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {isCreatingTask && (
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
          <TaskForm
            onSubmit={async (data) => {
              await onCreate(data);
              setIsCreatingTask(false);
            }}
            isSubmitting={isCreating}
            onCancel={() => setIsCreatingTask(false)}
          />
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Get started by creating your first task"
          action={
            <Button onClick={() => setIsCreatingTask(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDelete}
              onUpdate={onUpdate}
              isDeleting={isDeleting}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
