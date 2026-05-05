import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        users (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { user_id, plan_type } = req.body;

    if (!user_id || !plan_type) {
      return res.status(400).json({ error: 'user_id and plan_type are required' });
    }

    const startDate = new Date();
    let endDate = new Date();

    if (plan_type === '1 Month') {
      endDate.setMonth(startDate.getMonth() + 1);
    } else if (plan_type === '3 Months') {
      endDate.setMonth(startDate.getMonth() + 3);
    } else if (plan_type === '6 Months') {
      endDate.setMonth(startDate.getMonth() + 6);
    } else if (plan_type === '1 Year') {
      endDate.setFullYear(startDate.getFullYear() + 1);
    } else {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // First cancel any existing active subscriptions for this user
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', user_id)
      .eq('status', 'active');

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id,
          plan_type,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Subscription assigned successfully', subscription });
  } catch (error) {
    console.error('Error assigning subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active', 'cancelled', 'expired'

    if (!['active', 'cancelled', 'expired'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data: updatedSub, error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Subscription status updated', subscription: updatedSub });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
