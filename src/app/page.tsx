"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase-client";
import Session from "./Session";

export default function Home() {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

  const [tasks, setTasks] = useState<any[]>([]);
  const [editingTask, setEditingTask] = useState<any>(null);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.log("error fetching tasks", error.message);
    }
    console.log(data, error);
    setTasks(data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const uploadImage = async (image: File) => {
    const filePath = `${Date.now()}-${image.name}`;
    const { error } = await supabase.storage
      .from("tasks-images")
      .upload(filePath, image);

    if (error) {
      console.log("error uploading file", error);
    }

    const { data } = await supabase.storage
      .from("tasks-images")
      .getPublicUrl(filePath);

    return data?.publicUrl;
  };

  const handleSubmit = async () => {
    let imageUrl = null;
    if (taskImage) {
      imageUrl = await uploadImage(taskImage);
    }

    const { data, error } = await supabase.from("tasks").insert({
      ...newTask,
      email: session?.user?.email,
      image_url: imageUrl,
    });
    if (error) {
      console.log("error inserting task", error);
    }
    console.log(data);
    fetchTasks();
    setNewTask({ title: "", description: "" });
  };

  const handleDelete = async (id: string) => {
    const { data, error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      console.log("error deleting task", error);
    }
    console.log(data);
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleEdit = async (id: string) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        title: editingTask.title,
        description: editingTask.description,
        email: session?.user?.email,
        image_url: editingTask.image_url,
      })
      .eq("id", id);
    if (error) {
      console.log("error updating task", error);
    }
    console.log(data);
    fetchTasks();
    setEditingTask(null);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("error signing out", error);
    }
    alert("signed out");
  };

  const [session, setSession] = useState<any>(null);
  const fetchSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log("error fetching session", error);
    }
    console.log(data);
    setSession(data.session);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    const channel = supabase.channel("task-channel");
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          setTasks((prevTasks) => [...prevTasks, payload?.new]);
        }
      )
      .subscribe((status, error) => {
        console.log("subscription", status, error);
      });
  }, []);

  const [taskImage, setTaskImage] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTaskImage(file);
    }
  };

  return (
    <>
      <Session />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex flex-col gap-2 p-4 border border-gray-300 rounded bg-zinc-300 text-black"
      >
        <label htmlFor="title">Title</label>
        <input
          className="border border-black rounded p-2"
          type="text"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <label htmlFor="description">Description</label>
        <input
          className="border border-black rounded p-2"
          type="text"
          value={newTask.description}
          onChange={(e) =>
            setNewTask({ ...newTask, description: e.target.value })
          }
        />

        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button type="submit" className="bg-blue-500 text-white p-2">
          Add Task
        </button>
      </form>
      <div>
        {tasks.map((task: any) => (
          <div
            key={task.id}
            className="flex flex-col gap-2 p-4 border border-gray-300 rounded  text-black bg-amber-50"
          >
            <h2>{task.title}</h2>
            <p>{task.description}</p>
            <img src={task.image_url} alt={task.title + "image"} />

            {editingTask?.id === task.id && (
              <>
                <input
                  type="text"
                  placeholder="New Title"
                  className="border border-black rounded p-2"
                  value={editingTask?.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="New Description"
                  className="border border-black rounded p-2"
                  value={editingTask?.description}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  }
                />
              </>
            )}
            <div className="flex gap-2">
              <button
                className="bg-blue-500 text-white p-2"
                onClick={() => setEditingTask(task)}
              >
                Edit
              </button>
              {editingTask?.id === task.id && (
                <button
                  className="bg-blue-500 text-white p-2"
                  onClick={() => handleEdit(task.id)}
                >
                  Save
                </button>
              )}
              <button
                className="bg-red-500 text-white p-2"
                onClick={() => handleDelete(task.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        <button className="bg-blue-500 text-white p-2" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </>
  );
}
