import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import bcrypt from 'bcrypt';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, goal, created_at');

    if (error) {
      throw error;
    }

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, goal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const { data: user, error } = await supabase
      .from('users')
      .insert([
        { name, email, password_hash, role: role || 'user', goal }
      ])
      .select('id, name, email, role, goal, created_at')
      .single();

    if (error) {
      // Handle unique constraint violations
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      throw error;
    }

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, goal, trainer_id } = req.body;

    // Build update object dynamically
    const updates: any = {};
    if (role !== undefined) updates.role = role;
    if (goal !== undefined) updates.goal = goal || null;
    if (trainer_id !== undefined) updates.trainer_id = trainer_id || null;

    if (trainer_id) {
      // Validate that the assigned trainer actually has the 'trainer' role
      const { data: trainer, error: trainerError } = await supabase
        .from('users')
        .select('role')
        .eq('id', trainer_id)
        .single();
        
      if (trainerError || trainer?.role !== 'trainer') {
        return res.status(400).json({ error: 'Assigned user is not a valid trainer' });
      }
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, name, email, role, goal, trainer_id')
      .single();

    if (error) throw error;

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
