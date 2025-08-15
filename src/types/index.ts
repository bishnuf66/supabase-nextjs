export interface Task {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  image?: File | null;
}

export interface User {
  id: string;
  email: string;
  // Add other user fields as needed
}
