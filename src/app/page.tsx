"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Task } from "@/types";
import { PostgresChangesPayload } from "@/types/supabase";
import { TasksList } from "@/features/tasks/components/TasksList";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [session, setSession] = useState<any>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/signin");
        return;
      }

      setSession(session);

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("email", session.user.email)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task creation
  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    image?: File | null;
  }) => {
    try {
      setIsCreating(true);

      if (!session) {
        router.push("/signin");
        return;
      }

      let imageUrl = "";
      let imagePath = "";

      // Handle image upload first if present
      if (taskData.image) {
        console.log("Image found, starting upload:", taskData.image.name);

        // Generate a temporary ID for the file name
        const tempId = crypto.randomUUID();
        const fileExt = taskData.image.name.split(".").pop();
        const fileName = `${tempId}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        console.log("Upload path:", filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("tasks-images")
          .upload(filePath, taskData.image);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        console.log("Upload successful:", uploadData);

        const {
          data: { publicUrl },
        } = supabase.storage.from("tasks-images").getPublicUrl(filePath);

        console.log("Public URL:", publicUrl);

        imageUrl = publicUrl;
        imagePath = filePath;
      } else {
        console.log("No image provided");
      }

      // Create task with image data (or empty strings if no image)
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title: taskData.title,
            description: taskData.description,
            email: session.user.email,
            image_url: imageUrl,
            image_path: imagePath,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      console.log("Task created successfully:", data);


      return data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  // Handle task update
  const handleUpdateTask = async (
    id: string,
    taskData: { title: string; description: string; image?: File | null }
  ) => {
    try {
      setIsUpdating(true);

      const updates: {
        title: string;
        description: string;
        updated_at: string;
        image_url?: string | null;
        image_path?: string | null;
      } = {
        title: taskData.title,
        description: taskData.description,
        updated_at: new Date().toISOString(),
      };

      // If there's a new image, upload it
      if (taskData.image) {
        // First, delete the old image if it exists
        const { data: existingTask } = await supabase
          .from("tasks")
          .select("image_path")
          .eq("id", id)
          .single();

        if (existingTask?.image_path) {
          const { error: deleteError } = await supabase.storage
            .from("tasks-images")
            .remove([existingTask.image_path]);

          if (deleteError)
            console.error("Error deleting old image:", deleteError);
        }

        // Upload the new image
        const fileExt = taskData.image.name.split(".").pop();
        const fileName = `${id}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("tasks-images")
          .upload(filePath, taskData.image, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("tasks-images").getPublicUrl(filePath);

        updates.image_url = publicUrl;
        updates.image_path = filePath;
      }

      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setTasks((prev) => prev.map((task) => (task.id === id ? data : task)));
      return data;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (id: string) => {
    try {
      setIsDeleting(true);
      console.log("Starting delete for task:", id);

      // First, get the task to check for an associated image
      const { data: taskToDelete, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Error fetching task to delete:", fetchError);
        throw fetchError;
      }

      console.log("Task to delete:", taskToDelete);

      // Delete the image if it exists
      if (taskToDelete?.image_path && taskToDelete.image_path !== "") {
        console.log("Deleting image:", taskToDelete.image_path);
        const { error: deleteImageError } = await supabase.storage
          .from("tasks-images")
          .remove([taskToDelete.image_path]);

        if (deleteImageError) {
          console.error("Error deleting image:", deleteImageError);
          // Continue with task deletion even if image deletion fails
        } else {
          console.log("Image deleted successfully");
        }
      } else {
        console.log("No image to delete");
      }

      // Delete the task
      console.log("Deleting task from database");
      const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Error deleting task:", deleteError);
        throw deleteError;
      }

      console.log("Task deleted successfully");

      // Update the local state
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();

    // Set up real-time subscription
    const channel = supabase
      .channel("realtime-tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `email=eq.${session?.user?.email}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [payload.new as Task, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((task) =>
                task.id === (payload.new as Task).id
                  ? (payload.new as Task)
                  : task
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) =>
              prev.filter((task) => task.id !== (payload.old as Task).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.email]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary"></div>
          <p className="text-muted-foreground text-sm">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Task Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-muted-foreground text-xs font-medium">
                  {session?.user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {session?.user?.email}
              </span>
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <TasksList
            tasks={tasks}
            onCreate={handleCreateTask}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            isLoading={isLoading}
            isCreating={isCreating}
            isDeleting={isDeleting}
            isUpdating={isUpdating}
          />
        </div>
      </main>

      <footer className="border-t bg-card/30 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Task Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
